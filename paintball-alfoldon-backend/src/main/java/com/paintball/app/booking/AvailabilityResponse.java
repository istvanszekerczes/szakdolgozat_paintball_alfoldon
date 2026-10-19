package com.paintball.app.booking;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Slots of one venue on one day. {@code bookable} is false for the whole day when it is too soon
 * (inside the one-week rule) or too far ahead.
 */
public record AvailabilityResponse(String venueSlug, LocalDate date, boolean bookable, List<Slot> slots) {

    public record Slot(LocalTime start, LocalTime end, boolean available) {
    }
}
