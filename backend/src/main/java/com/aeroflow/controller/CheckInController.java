package com.aeroflow.controller;

import com.aeroflow.entity.Booking;
import com.aeroflow.entity.Passenger;
import com.aeroflow.service.BookingService;
import com.aeroflow.service.CheckInService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/checkin")
public class CheckInController {

    @Autowired
    private CheckInService checkInService;

    @Autowired
    private BookingService bookingService;

    @PostMapping("/{pnr}")
    public ResponseEntity<Map<String, Object>> checkIn(
            @PathVariable String pnr,
            @RequestParam String lastName) {
        Booking booking = checkInService.performCheckIn(pnr, lastName);
        List<Passenger> passengers = bookingService.getPassengersForBooking(booking.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("booking", booking);
        response.put("passengers", passengers);
        response.put("message", "Check-in successful! Your boarding pass is ready.");

        return ResponseEntity.ok(response);
    }
}
