package com.aeroflow.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class BookingRequest {
    private Long flightId;
    private String travelClass;
    private List<PassengerDto> passengers;
}
