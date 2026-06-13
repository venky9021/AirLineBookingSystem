package com.aeroflow.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
public class PassengerDto {
    private String firstName;
    private String lastName;
    private String passportNumber;
    private LocalDate dob;
    private String nationality;
    private String seatNumber;
}
