package com.paintball.app.schedule;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

import com.paintball.app.booking.Booking;
import com.paintball.app.booking.BookingStatus;
import com.paintball.app.car.Car;
import com.paintball.app.customer.Customer;
import com.paintball.app.employee.Employee;
import com.paintball.app.employee.EmploymentType;
import com.paintball.app.venue.Venue;

/** Small builders shared by the schedule, assignment and alert tests. */
public final class ScheduleTestData {

    public static final LocalDate DAY = LocalDate.of(2026, 11, 7);

    private ScheduleTestData() {
    }

    /** Venue with the default 45 min setup and 30 min teardown. */
    public static Venue venue(long id, String name, int travelMinutes) {
        Venue venue = new Venue();
        venue.setId(id);
        venue.setSlug(name.toLowerCase());
        venue.setName(name);
        venue.setTravelMinutes(travelMinutes);
        return venue;
    }

    public static Booking game(long id, Venue venue, String start, String end) {
        return game(id, venue, DAY, start, end, BookingStatus.ACCEPTED);
    }

    public static Booking game(long id, Venue venue, LocalDate date, String start, String end, BookingStatus status) {
        Customer customer = new Customer();
        customer.setName("Kiss Béla");
        Booking booking = new Booking();
        booking.setId(id);
        booking.setVenue(venue);
        booking.setCustomer(customer);
        booking.setContactName(customer.getName());
        booking.setContactPhone(customer.getPhone());
        booking.setPlayDate(date);
        booking.setStartTime(LocalTime.parse(start));
        booking.setEndTime(LocalTime.parse(end));
        booking.setHeadcount(20);
        booking.setStatus(status);
        booking.setCreatedAt(Instant.parse("2026-10-01T10:00:00Z"));
        booking.setUpdatedAt(Instant.parse("2026-10-01T10:00:00Z"));
        return booking;
    }

    public static Car car(long id, String plate, int seats) {
        Car car = new Car();
        car.setId(id);
        car.setPlate(plate);
        car.setSeats(seats);
        return car;
    }

    public static Employee employee(long id, String name) {
        Employee employee = new Employee();
        employee.setId(id);
        employee.setName(name);
        employee.setEmploymentType(EmploymentType.FULL_TIME);
        return employee;
    }
}
