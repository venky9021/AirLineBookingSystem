package com.aeroflow.controller;

import com.aeroflow.dto.BookingRequest;
import com.aeroflow.entity.Booking;
import com.aeroflow.entity.Passenger;
import com.aeroflow.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping
    public ResponseEntity<Booking> createBooking(@RequestBody BookingRequest bookingRequest) {
        return ResponseEntity.ok(bookingService.createBooking(bookingRequest));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Booking>> getMyBookings() {
        return ResponseEntity.ok(bookingService.getMyBookings());
    }

    @GetMapping("/{pnr}")
    public ResponseEntity<Map<String, Object>> getBookingByPnr(@PathVariable String pnr) {
        Booking booking = bookingService.getBookingByPnr(pnr);
        List<Passenger> passengers = bookingService.getPassengersForBooking(booking.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("booking", booking);
        response.put("passengers", passengers);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancelBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.cancelBooking(id));
    }
}
