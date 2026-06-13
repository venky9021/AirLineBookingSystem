package com.aeroflow.service;

import com.aeroflow.entity.Booking;
import com.aeroflow.entity.Passenger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${aeroflow.mail.sender:noreply@aeroflow.com}")
    private String senderEmail;

    @Value("${aeroflow.mail.simulate:true}")
    private boolean simulateMail;

    public void sendBookingConfirmationEmail(Booking booking, List<Passenger> passengers) {
        String recipient = booking.getUser() != null ? booking.getUser().getEmail() : "customer@aeroflow.com";
        String subject = "AeroFlow — E-Ticket Confirmation: PNR " + booking.getPnr();
        
        StringBuilder content = new StringBuilder();
        content.append("Dear Traveler,\n\n");
        content.append("Thank you for choosing AeroFlow. Your flight booking has been confirmed!\n\n");
        content.append("--- BOOKING INFORMATION ---\n");
        content.append("PNR Number: ").append(booking.getPnr()).append("\n");
        content.append("Route: ").append(booking.getFlight().getOrigin()).append(" -> ").append(booking.getFlight().getDestination()).append("\n");
        content.append("Flight: ").append(booking.getFlight().getFlightNumber()).append(" (").append(booking.getFlight().getAirline().getName()).append(")\n");
        content.append("Departure Time: ").append(booking.getFlight().getDepartureTime()).append("\n");
        content.append("Arrival Time: ").append(booking.getFlight().getArrivalTime()).append("\n");
        content.append("Travel Class: ").append(booking.getTravelClass()).append("\n");
        content.append("Total Amount Paid: $").append(booking.getTotalPrice()).append("\n\n");
        
        content.append("--- PASSENGER DETAILS ---\n");
        for (Passenger p : passengers) {
            content.append("- ").append(p.getFirstName()).append(" ").append(p.getLastName())
                   .append(" (Seat: ").append(p.getSeatNumber()).append(", Passport: ")
                   .append(p.getPassportNumber()).append(")\n");
        }
        
        content.append("\nHave a pleasant journey!\n");
        content.append("AeroFlow Customer Relations Team\n");

        if (simulateMail) {
            System.out.println("\n=======================================================");
            System.out.println("SIMULATING EMAIL SENDING TO: " + recipient);
            System.out.println("SUBJECT: " + subject);
            System.out.println("BODY:\n" + content);
            System.out.println("=======================================================\n");
        } else if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(senderEmail);
                message.setTo(recipient);
                message.setSubject(subject);
                message.setText(content.toString());
                mailSender.send(message);
            } catch (Exception e) {
                System.err.println("Failed to send real SMTP mail. Falling back to console print: " + e.getMessage());
                System.out.println(content);
            }
        } else {
            System.out.println("No JavaMailSender configured and simulate is false. Printing ticket to console:");
            System.out.println(content);
        }
    }
}
