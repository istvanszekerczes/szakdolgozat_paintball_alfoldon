package com.paintball.app.booking;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

public record AdminBookingResponse(Long id, String venueSlug, String venueName, LocalDate date,
        LocalTime startTime, LocalTime endTime, int headcount, String note, BookingStatus status,
        Customer customer, Instant createdAt, Instant updatedAt) {

    public record Customer(String name, String email, String phone) {
    }

    public static AdminBookingResponse from(Booking booking) {
        var customer = booking.getCustomer();
        return new AdminBookingResponse(booking.getId(), booking.getVenue().getSlug(), booking.getVenue().getName(),
                booking.getPlayDate(), booking.getStartTime(), booking.getEndTime(), booking.getHeadcount(),
                booking.getNote(), booking.getStatus(),
                new Customer(customer.getName(), customer.getEmail(), customer.getPhone()),
                booking.getCreatedAt(), booking.getUpdatedAt());
    }
}
