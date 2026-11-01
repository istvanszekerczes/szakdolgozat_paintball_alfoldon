package com.paintball.app.booking;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;

public record AdminBookingResponse(Long id, String venueSlug, String venueName, LocalDate date,
        LocalTime startTime, LocalTime endTime, int headcount, String note, BookingStatus status,
        Customer customer, Instant createdAt, Instant updatedAt, CarRef car, List<EmployeeRef> employees) {

    public record Customer(String name, String email, String phone) {
    }

    /** The assigned car, null when there is none yet. */
    public record CarRef(Long id, String plate, int seats) {
    }

    public record EmployeeRef(Long id, String name) {
    }

    public static AdminBookingResponse from(Booking booking) {
        var customer = booking.getCustomer();
        var car = booking.getCar();
        return new AdminBookingResponse(booking.getId(), booking.getVenue().getSlug(), booking.getVenue().getName(),
                booking.getPlayDate(), booking.getStartTime(), booking.getEndTime(), booking.getHeadcount(),
                booking.getNote(), booking.getStatus(),
                new Customer(customer.getName(), customer.getEmail(), customer.getPhone()),
                booking.getCreatedAt(), booking.getUpdatedAt(),
                car == null ? null : new CarRef(car.getId(), car.getPlate(), car.getSeats()),
                booking.getEmployees().stream()
                        .map(e -> new EmployeeRef(e.getId(), e.getName()))
                        .sorted(Comparator.comparing(EmployeeRef::name))
                        .toList());
    }
}
