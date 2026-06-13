package com.aeroflow.controller;

import com.aeroflow.dto.AdminFlightRequest;
import com.aeroflow.entity.Flight;
import com.aeroflow.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/flights")
    public ResponseEntity<List<Flight>> listAllFlights() {
        return ResponseEntity.ok(adminService.getAllFlights());
    }

    @PostMapping("/flights")
    public ResponseEntity<Flight> createFlight(@RequestBody AdminFlightRequest request) {
        return ResponseEntity.ok(adminService.addFlight(request));
    }

    @PutMapping("/flights/{id}")
    public ResponseEntity<Flight> updateFlight(@PathVariable Long id, @RequestBody AdminFlightRequest request) {
        return ResponseEntity.ok(adminService.updateFlight(id, request));
    }

    @DeleteMapping("/flights/{id}")
    public ResponseEntity<Map<String, Object>> cancelFlight(@PathVariable Long id) {
        adminService.cancelFlight(id);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Flight has been successfully cancelled and all passenger seats released.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getDashboardAnalytics() {
        return ResponseEntity.ok(adminService.getDashboardAnalytics());
    }
}
