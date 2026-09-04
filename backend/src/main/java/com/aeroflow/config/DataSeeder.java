package com.aeroflow.config;

import com.aeroflow.entity.Airline;
import com.aeroflow.entity.Flight;
import com.aeroflow.repository.AirlineRepository;
import com.aeroflow.repository.FlightRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private static final String[][] AIRLINES = {
            {"IndiGo", "6E", "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=100&auto=format&fit=crop&q=60"},
            {"Air India", "AI", "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=100&auto=format&fit=crop&q=60"},
            {"Akasa Air", "QP", "https://images.unsplash.com/photo-1517999144091-3d9dca6d1e43?w=100&auto=format&fit=crop&q=60"},
            {"AIX Connect", "I5", "https://images.unsplash.com/photo-1483450388369-9ed95738483c?w=100&auto=format&fit=crop&q=60"},
            {"SpiceJet", "SG", "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=100&auto=format&fit=crop&q=60"}
    };

    private static final LocalTime[] DEPARTURE_SLOTS = {
            LocalTime.of(8, 0),
            LocalTime.of(10, 30),
            LocalTime.of(13, 15),
            LocalTime.of(16, 45),
            LocalTime.of(19, 20)
    };

    private final AirlineRepository airlineRepository;
    private final FlightRepository flightRepository;

    public DataSeeder(AirlineRepository airlineRepository, FlightRepository flightRepository) {
        this.airlineRepository = airlineRepository;
        this.flightRepository = flightRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (flightRepository.count() > 0) {
            log.info("Flight catalog already present; skipping seed");
            return;
        }

        List<Airline> airlines = seedAirlines();
        List<Route> routes = routes();
        LocalDate start = LocalDate.of(2026, 9, 4);
        LocalDate end = LocalDate.of(2026, 9, 25);

        List<Flight> batch = new ArrayList<>();
        int routeIndex = 1;
        int saved = 0;
        for (Route route : routes) {
            for (LocalDate day = start; !day.isAfter(end); day = day.plusDays(1)) {
                for (int i = 0; i < airlines.size(); i++) {
                    Airline airline = airlines.get(i);
                    LocalDateTime departure = day.atTime(DEPARTURE_SLOTS[i]);
                    LocalDateTime arrival = departure.plusMinutes(route.durationMinutes);
                    String flightNumber = airline.getCode() + "-R" + routeIndex + "D" + String.format("%02d", day.getDayOfMonth());
                    batch.add(Flight.builder()
                            .flightNumber(flightNumber)
                            .airline(airline)
                            .origin(route.origin)
                            .destination(route.destination)
                            .departureTime(departure)
                            .arrivalTime(arrival)
                            .totalSeats(60)
                            .availableSeats(60)
                            .basePrice(route.price)
                            .status("ACTIVE")
                            .build());
                    if (batch.size() >= 400) {
                        flightRepository.saveAll(batch);
                        saved += batch.size();
                        batch.clear();
                    }
                }
            }
            routeIndex++;
        }
        if (!batch.isEmpty()) {
            flightRepository.saveAll(batch);
            saved += batch.size();
        }
        log.info("Seeded {} airlines and {} flights", airlines.size(), saved);
    }

    private List<Airline> seedAirlines() {
        List<Airline> existing = airlineRepository.findAll();
        if (!existing.isEmpty()) {
            return existing;
        }
        List<Airline> created = new ArrayList<>();
        for (String[] row : AIRLINES) {
            created.add(Airline.builder().name(row[0]).code(row[1]).logoUrl(row[2]).build());
        }
        return airlineRepository.saveAll(created);
    }

    private List<Route> routes() {
        return List.of(
                new Route("Delhi (DEL)", "Mumbai (BOM)", 135, "4600.00"),
                new Route("Delhi (DEL)", "Bengaluru (BLR)", 165, "5200.00"),
                new Route("Delhi (DEL)", "Goa (GOI)", 150, "5400.00"),
                new Route("Delhi (DEL)", "Kochi (COK)", 195, "6200.00"),
                new Route("Delhi (DEL)", "Jaipur (JAI)", 55, "2400.00"),
                new Route("Delhi (DEL)", "Hyderabad (HYD)", 120, "4200.00"),
                new Route("Mumbai (BOM)", "Delhi (DEL)", 135, "4600.00"),
                new Route("Mumbai (BOM)", "Bengaluru (BLR)", 105, "3600.00"),
                new Route("Mumbai (BOM)", "Goa (GOI)", 75, "3500.00"),
                new Route("Mumbai (BOM)", "Kochi (COK)", 120, "4200.00"),
                new Route("Mumbai (BOM)", "Jaipur (JAI)", 110, "4100.00"),
                new Route("Mumbai (BOM)", "Hyderabad (HYD)", 80, "3200.00"),
                new Route("Bengaluru (BLR)", "Delhi (DEL)", 165, "5200.00"),
                new Route("Bengaluru (BLR)", "Mumbai (BOM)", 105, "3600.00"),
                new Route("Bengaluru (BLR)", "Goa (GOI)", 70, "2800.00"),
                new Route("Bengaluru (BLR)", "Kochi (COK)", 75, "3200.00"),
                new Route("Bengaluru (BLR)", "Jaipur (JAI)", 150, "4900.00"),
                new Route("Bengaluru (BLR)", "Hyderabad (HYD)", 65, "2600.00"),
                new Route("Goa (GOI)", "Delhi (DEL)", 150, "5400.00"),
                new Route("Goa (GOI)", "Mumbai (BOM)", 75, "3500.00"),
                new Route("Goa (GOI)", "Bengaluru (BLR)", 70, "2800.00"),
                new Route("Goa (GOI)", "Kochi (COK)", 80, "3600.00"),
                new Route("Goa (GOI)", "Jaipur (JAI)", 145, "5100.00"),
                new Route("Goa (GOI)", "Hyderabad (HYD)", 75, "3400.00"),
                new Route("Kochi (COK)", "Delhi (DEL)", 195, "6200.00"),
                new Route("Kochi (COK)", "Mumbai (BOM)", 120, "4200.00"),
                new Route("Kochi (COK)", "Bengaluru (BLR)", 75, "3200.00"),
                new Route("Kochi (COK)", "Goa (GOI)", 80, "3600.00"),
                new Route("Kochi (COK)", "Jaipur (JAI)", 170, "5800.00"),
                new Route("Kochi (COK)", "Hyderabad (HYD)", 105, "3800.00"),
                new Route("Jaipur (JAI)", "Delhi (DEL)", 55, "2400.00"),
                new Route("Jaipur (JAI)", "Mumbai (BOM)", 110, "4100.00"),
                new Route("Jaipur (JAI)", "Bengaluru (BLR)", 150, "4900.00"),
                new Route("Jaipur (JAI)", "Goa (GOI)", 145, "5100.00"),
                new Route("Jaipur (JAI)", "Kochi (COK)", 170, "5800.00"),
                new Route("Jaipur (JAI)", "Hyderabad (HYD)", 135, "4800.00"),
                new Route("Hyderabad (HYD)", "Delhi (DEL)", 120, "4200.00"),
                new Route("Hyderabad (HYD)", "Mumbai (BOM)", 80, "3200.00"),
                new Route("Hyderabad (HYD)", "Bengaluru (BLR)", 65, "2600.00"),
                new Route("Hyderabad (HYD)", "Goa (GOI)", 75, "3400.00"),
                new Route("Hyderabad (HYD)", "Kochi (COK)", 105, "3800.00"),
                new Route("Hyderabad (HYD)", "Jaipur (JAI)", 135, "4800.00")
        );
    }

    private record Route(String origin, String destination, int durationMinutes, String priceValue) {
        BigDecimal price() {
            return new BigDecimal(priceValue);
        }
    }
}
