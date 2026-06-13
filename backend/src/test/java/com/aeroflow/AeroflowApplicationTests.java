package com.aeroflow;

import com.aeroflow.service.AuthService;
import com.aeroflow.service.BookingService;
import com.aeroflow.service.FlightService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class AeroflowApplicationTests {

    @Autowired
    private ApplicationContext applicationContext;

    @Autowired
    private AuthService authService;

    @Autowired
    private FlightService flightService;

    @Autowired
    private BookingService bookingService;

    @Test
    void contextLoads() {
        assertNotNull(applicationContext, "Application context should load successfully.");
    }

    @Test
    void servicesInitialize() {
        assertNotNull(authService, "AuthService bean should be loaded in Spring context.");
        assertNotNull(flightService, "FlightService bean should be loaded in Spring context.");
        assertNotNull(bookingService, "BookingService bean should be loaded in Spring context.");
    }
}
