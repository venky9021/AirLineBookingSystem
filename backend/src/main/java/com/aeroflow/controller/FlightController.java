package com.aeroflow.controller;

import com.aeroflow.entity.Flight;
import com.aeroflow.entity.Seat;
import com.aeroflow.service.FlightService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/flights")
public class FlightController {

    @Autowired
    private FlightService flightService;

    @GetMapping("/search")
    public ResponseEntity<List<Flight>> searchFlights(
            @RequestParam(required = false) String origin,
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) String date) {
        return ResponseEntity.ok(flightService.searchFlights(origin, destination, date));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getFlightDetails(@PathVariable Long id) {
        Flight flight = flightService.getFlightById(id);
        List<Seat> seats = flightService.getSeatMapForFlight(id);

        Map<String, Object> response = new HashMap<>();
        response.put("flight", flight);
        response.put("seats", seats);

        return ResponseEntity.ok(response);
    }
}
