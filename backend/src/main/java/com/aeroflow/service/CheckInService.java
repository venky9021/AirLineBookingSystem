package com.aeroflow.service;

import com.aeroflow.entity.Booking;
import com.aeroflow.entity.Passenger;
import com.aeroflow.exception.InvalidBookingException;
import com.aeroflow.repository.BookingRepository;
import com.aeroflow.repository.PassengerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CheckInService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PassengerRepository passengerRepository;

    @Transactional
    public Booking performCheckIn(String pnr, String lastName) {
        Booking booking = bookingRepository.findByPnr(pnr)
                .orElseThrow(() -> new InvalidBookingException("No reservation found for PNR: " + pnr));

        if (!"CONFIRMED".equals(booking.getStatus()) && !"CHECKED_IN".equals(booking.getStatus())) {
            throw new InvalidBookingException("Check-in is only available for CONFIRMED bookings. Current status: " + booking.getStatus());
        }

        List<Passenger> passengers = passengerRepository.findByBookingId(booking.getId());
        
        boolean lastNameMatches = passengers.stream()
                .anyMatch(p -> p.getLastName().equalsIgnoreCase(lastName.trim()));

        if (!lastNameMatches) {
            throw new InvalidBookingException("No passenger matching last name '" + lastName + "' was found under PNR " + pnr);
        }

        booking.setStatus("CHECKED_IN");
        return bookingRepository.save(booking);
    }
}
