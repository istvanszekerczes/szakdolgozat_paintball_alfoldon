package com.paintball.app.schedule;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Map;

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

    /** Coordinates of the seeded venues the tests use, by name (V2 migration). */
    private static final Map<String, double[]> COORDINATES = Map.of(
            "Boszorkánysziget", new double[] { 46.232385, 20.143227 },
            "Katonai csarnok", new double[] { 46.234412, 20.138107 },
            "Szentes", new double[] { 46.662945, 20.280217 },
            "Tiszaliget", new double[] { 47.162229, 20.186734 },
            "Kecskemét", new double[] { 46.887551, 19.646280 });

    /** Venue with the default 45 min setup and 30 min teardown, at its real place when known. */
    public static Venue venue(long id, String name, int travelMinutes) {
        Venue venue = new Venue();
        double[] at = COORDINATES.getOrDefault(name, new double[] { 0, 0 });
        venue.setLatitude(at[0]);
        venue.setLongitude(at[1]);
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
