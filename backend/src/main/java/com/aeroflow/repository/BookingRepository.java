package com.aeroflow.repository;

import com.aeroflow.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByPnr(String pnr);
    List<Booking> findByUserId(Long userId);
    List<Booking> findByFlightId(Long flightId);
    Optional<Booking> findByPnrAndUserEmail(String pnr, String email);
}
