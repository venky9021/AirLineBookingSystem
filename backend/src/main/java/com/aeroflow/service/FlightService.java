package com.aeroflow.service;

import com.aeroflow.entity.Flight;
import com.aeroflow.entity.Seat;
import com.aeroflow.exception.ResourceNotFoundException;
import com.aeroflow.repository.FlightRepository;
import com.aeroflow.repository.SeatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class FlightService {

    @Autowired
    private FlightRepository flightRepository;

    @Autowired
    private SeatRepository seatRepository;

    public List<Flight> searchFlights(String origin, String destination, String dateStr) {
        LocalDateTime start;
        LocalDateTime end;

        if (dateStr != null && !dateStr.trim().isEmpty()) {
            LocalDate date = LocalDate.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE);
            start = date.atStartOfDay();
            end = date.atTime(LocalTime.MAX);
        } else {
            // Default to searching from today onwards for next 30 days
            start = LocalDateTime.now();
            end = start.plusDays(30);
        }

        return flightRepository.searchFlights(origin, destination, start, end);
    }

    public Flight getFlightById(Long id) {
        return flightRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flight not found with ID: " + id));
    }

    @Transactional
    public List<Seat> getSeatMapForFlight(Long flightId) {
        Flight flight = getFlightById(flightId);
        List<Seat> seats = seatRepository.findByFlightId(flightId);

        // If no seats exist for this flight, auto-initialize a 60-seat premium configuration
        if (seats.isEmpty()) {
            seats = new ArrayList<>();
            String[] columns = {"A", "B", "C", "D", "E", "F"};
            
            for (int row = 1; row <= 10; row++) {
                String seatClass;
                if (row <= 2) {
                    seatClass = "FIRST";
                } else if (row <= 4) {
                    seatClass = "BUSINESS";
                } else {
                    seatClass = "ECONOMY";
                }

                for (String col : columns) {
                    String seatNumber = row + col;
                    Seat seat = Seat.builder()
                            .flight(flight)
                            .seatNumber(seatNumber)
                            .seatClass(seatClass)
                            .isAvailable(true)
                            .build();
                    seats.add(seat);
                }
            }
            seats = seatRepository.saveAll(seats);
        }

        return seats;
    }
}
