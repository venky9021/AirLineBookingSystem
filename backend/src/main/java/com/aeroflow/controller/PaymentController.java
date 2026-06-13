package com.aeroflow.controller;

import com.aeroflow.dto.PaymentConfirmRequest;
import com.aeroflow.entity.Booking;
import com.aeroflow.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private BookingService bookingService;

    @PostMapping("/confirm")
    public ResponseEntity<Booking> confirmPayment(@RequestBody PaymentConfirmRequest confirmRequest) {
        return ResponseEntity.ok(bookingService.confirmPayment(confirmRequest));
    }
}
