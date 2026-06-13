package com.aeroflow.service;

import com.aeroflow.dto.BookingRequest;
import com.aeroflow.dto.PassengerDto;
import com.aeroflow.dto.PaymentConfirmRequest;
import com.aeroflow.entity.*;
import com.aeroflow.exception.InvalidBookingException;
import com.aeroflow.exception.ResourceNotFoundException;
import com.aeroflow.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private FlightRepository flightRepository;

    @Autowired
    private PassengerRepository passengerRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private EmailService emailService;

    @Transactional
    public Booking createBooking(BookingRequest request) {
        User currentUser = authService.getCurrentUser();
        Flight flight = flightRepository.findById(request.getFlightId())
                .orElseThrow(() -> new ResourceNotFoundException("Flight not found with ID: " + request.getFlightId()));

        if ("CANCELLED".equals(flight.getStatus())) {
            throw new InvalidBookingException("This flight has been cancelled and bookings are closed.");
        }

        if (request.getPassengers() == null || request.getPassengers().isEmpty()) {
            throw new InvalidBookingException("A booking must include at least one passenger.");
        }

        // Validate seats availability first
        List<Seat> selectedSeats = new ArrayList<>();
        for (PassengerDto pDto : request.getPassengers()) {
            Seat seat = seatRepository.findByFlightIdAndSeatNumber(flight.getId(), pDto.getSeatNumber())
                    .orElseThrow(() -> new ResourceNotFoundException("Seat " + pDto.getSeatNumber() + " not found for this flight."));

            if (!seat.getIsAvailable()) {
                throw new InvalidBookingException("Seat " + pDto.getSeatNumber() + " is already taken!");
            }
            selectedSeats.add(seat);
        }

        // Generate PNR
        String pnr = generateUniquePnr();

        // Calculate Pricing
        BigDecimal classMultiplier = switch (request.getTravelClass().toUpperCase()) {
            case "FIRST" -> BigDecimal.valueOf(2.5);
            case "BUSINESS" -> BigDecimal.valueOf(1.5);
            default -> BigDecimal.valueOf(1.0); // ECONOMY
        };

        BigDecimal ticketBasePrice = flight.getBasePrice().multiply(classMultiplier);
        BigDecimal passengerCount = BigDecimal.valueOf(request.getPassengers().size());
        
        // base = base * passengers * multiplier
        BigDecimal baseFare = ticketBasePrice.multiply(passengerCount);
        // taxes (10% base)
        BigDecimal taxes = baseFare.multiply(BigDecimal.valueOf(0.10));
        // convenience fee ($15 flat)
        BigDecimal convenienceFee = BigDecimal.valueOf(15.00);
        
        BigDecimal totalPrice = baseFare.add(taxes).add(convenienceFee);

        // Save Booking
        Booking booking = Booking.builder()
                .pnr(pnr)
                .user(currentUser)
                .flight(flight)
                .travelClass(request.getTravelClass().toUpperCase())
                .totalPrice(totalPrice)
                .status("PENDING")
                .build();

        booking = bookingRepository.save(booking);

        // Save Passengers & Lock Seats
        List<Passenger> passengers = new ArrayList<>();
        for (int i = 0; i < request.getPassengers().size(); i++) {
            PassengerDto pDto = request.getPassengers().get(i);
            
            // Link Passenger
            Passenger passenger = Passenger.builder()
                    .booking(booking)
                    .firstName(pDto.getFirstName())
                    .lastName(pDto.getLastName())
                    .passportNumber(pDto.getPassportNumber())
                    .dob(pDto.getDob())
                    .nationality(pDto.getNationality())
                    .seatNumber(pDto.getSeatNumber())
                    .build();
            
            passengers.add(passengerRepository.save(passenger));

            // Mark seat as locked
            Seat seat = selectedSeats.get(i);
            seat.setIsAvailable(false);
            seat.setBookedByBooking(booking);
            seatRepository.save(seat);
        }

        return booking;
    }

    @Transactional
    public Booking confirmPayment(PaymentConfirmRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + request.getBookingId()));

        if (!"PENDING".equals(booking.getStatus())) {
            throw new InvalidBookingException("Booking is already processed or cancelled.");
        }

        // Save Payment details
        Payment payment = Payment.builder()
                .booking(booking)
                .amount(request.getAmount())
                .method(request.getMethod())
                .gatewayTxnId(request.getGatewayTxnId())
                .status("SUCCESS")
                .paidAt(LocalDateTime.now())
                .build();
        paymentRepository.save(payment);

        // Update Booking Status
        booking.setStatus("CONFIRMED");
        booking = bookingRepository.save(booking);

        // Update Flight seats capacity
        Flight flight = booking.getFlight();
        int passengerCount = passengerRepository.findByBookingId(booking.getId()).size();
        flight.setAvailableSeats(Math.max(0, flight.getAvailableSeats() - passengerCount));
        flightRepository.save(flight);

        // Fetch passengers and trigger e-ticket email simulation
        List<Passenger> passengers = passengerRepository.findByBookingId(booking.getId());
        emailService.sendBookingConfirmationEmail(booking, passengers);

        return booking;
    }

    @Transactional
    public Booking cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        if ("CANCELLED".equals(booking.getStatus())) {
            throw new InvalidBookingException("Booking is already cancelled.");
        }

        // Release seats
        List<Seat> seats = seatRepository.findByFlightId(booking.getFlight().getId());
        for (Seat seat : seats) {
            if (seat.getBookedByBooking() != null && seat.getBookedByBooking().getId().equals(bookingId)) {
                seat.setIsAvailable(true);
                seat.setBookedByBooking(null);
                seatRepository.save(seat);
            }
        }

        // Restore Flight seats capacity if it was already confirmed
        if ("CONFIRMED".equals(booking.getStatus())) {
            Flight flight = booking.getFlight();
            int passengerCount = passengerRepository.findByBookingId(bookingId).size();
            flight.setAvailableSeats(Math.min(flight.getTotalSeats(), flight.getAvailableSeats() + passengerCount));
            flightRepository.save(flight);
        }

        // Cancel payment if exists
        Optional<Payment> paymentOpt = paymentRepository.findByBookingId(bookingId);
        if (paymentOpt.isPresent()) {
            Payment payment = paymentOpt.get();
            payment.setStatus("REFUNDED");
            paymentRepository.save(payment);
        }

        booking.setStatus("CANCELLED");
        return bookingRepository.save(booking);
    }

    public Booking getBookingByPnr(String pnr) {
        return bookingRepository.findByPnr(pnr)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with PNR: " + pnr));
    }

    public List<Booking> getMyBookings() {
        User currentUser = authService.getCurrentUser();
        return bookingRepository.findByUserId(currentUser.getId());
    }

    public List<Passenger> getPassengersForBooking(Long bookingId) {
        return passengerRepository.findByBookingId(bookingId);
    }

    private String generateUniquePnr() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random random = new Random();
        StringBuilder pnr;
        do {
            pnr = new StringBuilder(6);
            for (int i = 0; i < 6; i++) {
                pnr.append(chars.charAt(random.nextInt(chars.length())));
            }
        } while (bookingRepository.findByPnr(pnr.toString()).isPresent());

        return pnr.toString();
    }
}
