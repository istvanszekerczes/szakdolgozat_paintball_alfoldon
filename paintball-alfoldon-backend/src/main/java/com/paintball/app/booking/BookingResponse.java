package com.paintball.app.booking;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

/** Booking as shown to the customer and the admin. Customer contact data only goes to the admin variant. */
public record BookingResponse(Long id, String venueSlug, String venueName, LocalDate date, LocalTime startTime,
        LocalTime endTime, int headcount, BookingStatus status, Instant createdAt) {

    public static BookingResponse from(Booking booking) {
        return new BookingResponse(booking.getId(), booking.getVenue().getSlug(), booking.getVenue().getName(),
                booking.getPlayDate(), booking.getStartTime(), booking.getEndTime(), booking.getHeadcount(),
                booking.getStatus(), booking.getCreatedAt());
    }
}
