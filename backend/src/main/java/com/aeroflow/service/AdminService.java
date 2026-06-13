package com.aeroflow.service;

import com.aeroflow.dto.AdminFlightRequest;
import com.aeroflow.entity.Airline;
import com.aeroflow.entity.Booking;
import com.aeroflow.entity.Flight;
import com.aeroflow.entity.Seat;
import com.aeroflow.exception.InvalidBookingException;
import com.aeroflow.exception.ResourceNotFoundException;
import com.aeroflow.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private FlightRepository flightRepository;

    @Autowired
    private AirlineRepository airlineRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private BookingService bookingService;

    public List<Flight> getAllFlights() {
        return flightRepository.findAll();
    }

    @Transactional
    public Flight addFlight(AdminFlightRequest request) {
        Airline airline = airlineRepository.findById(request.getAirlineId())
                .orElseThrow(() -> new ResourceNotFoundException("Airline not found with ID: " + request.getAirlineId()));

        Flight flight = Flight.builder()
                .flightNumber(request.getFlightNumber())
                .airline(airline)
                .origin(request.getOrigin())
                .destination(request.getDestination())
                .departureTime(request.getDepartureTime())
                .arrivalTime(request.getArrivalTime())
                .totalSeats(request.getTotalSeats())
                .availableSeats(request.getTotalSeats())
                .basePrice(request.getBasePrice())
                .status("ACTIVE")
                .build();

        return flightRepository.save(flight);
    }

    @Transactional
    public Flight updateFlight(Long id, AdminFlightRequest request) {
        Flight flight = flightRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flight not found with ID: " + id));

        Airline airline = airlineRepository.findById(request.getAirlineId())
                .orElseThrow(() -> new ResourceNotFoundException("Airline not found with ID: " + request.getAirlineId()));

        flight.setFlightNumber(request.getFlightNumber());
        flight.setAirline(airline);
        flight.setOrigin(request.getOrigin());
        flight.setDestination(request.getDestination());
        flight.setDepartureTime(request.getDepartureTime());
        flight.setArrivalTime(request.getArrivalTime());
        flight.setBasePrice(request.getBasePrice());

        return flightRepository.save(flight);
    }

    @Transactional
    public void cancelFlight(Long id) {
        Flight flight = flightRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flight not found with ID: " + id));

        if ("CANCELLED".equals(flight.getStatus())) {
            throw new InvalidBookingException("Flight is already cancelled.");
        }

        flight.setStatus("CANCELLED");
        flightRepository.save(flight);

        // Cancel all bookings on this flight
        List<Booking> bookings = bookingRepository.findByFlightId(id);
        for (Booking booking : bookings) {
            if (!"CANCELLED".equals(booking.getStatus())) {
                bookingService.cancelBooking(booking.getId());
            }
        }
    }

    public Map<String, Object> getDashboardAnalytics() {
        List<Booking> bookings = bookingRepository.findAll();
        long totalBookings = bookings.size();

        BigDecimal totalRevenue = bookings.stream()
                .filter(b -> "CONFIRMED".equals(b.getStatus()) || "CHECKED_IN".equals(b.getStatus()))
                .map(Booking::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalFlights = flightRepository.count();
        long totalUsers = userRepository.count();

        // Calculate class occupancy breakdowns
        long economyCount = bookings.stream().filter(b -> "ECONOMY".equals(b.getTravelClass())).count();
        long businessCount = bookings.stream().filter(b -> "BUSINESS".equals(b.getTravelClass())).count();
        long firstCount = bookings.stream().filter(b -> "FIRST".equals(b.getTravelClass())).count();

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalRevenue", totalRevenue);
        analytics.put("totalBookings", totalBookings);
        analytics.put("totalFlights", totalFlights);
        analytics.put("totalUsers", totalUsers);
        
        Map<String, Long> classOccupancy = new HashMap<>();
        classOccupancy.put("ECONOMY", economyCount);
        classOccupancy.put("BUSINESS", businessCount);
        classOccupancy.put("FIRST", firstCount);
        analytics.put("classOccupancy", classOccupancy);

        // Include airline-wise booking revenue breakdown
        Map<String, BigDecimal> airlineRevenue = bookings.stream()
                .filter(b -> "CONFIRMED".equals(b.getStatus()) || "CHECKED_IN".equals(b.getStatus()))
                .collect(Collectors.groupingBy(
                        b -> b.getFlight().getAirline().getName(),
                        Collectors.reducing(BigDecimal.ZERO, Booking::getTotalPrice, BigDecimal::add)
                ));
        analytics.put("airlineRevenue", airlineRevenue);

        return analytics;
    }
}
