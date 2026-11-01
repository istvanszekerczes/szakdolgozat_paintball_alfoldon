package com.paintball.app.alert;

import static com.paintball.app.schedule.ScheduleTestData.car;
import static com.paintball.app.schedule.ScheduleTestData.employee;
import static com.paintball.app.schedule.ScheduleTestData.game;
import static com.paintball.app.schedule.ScheduleTestData.venue;
import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.Test;

import com.paintball.app.alert.AlertRules.Alert;
import com.paintball.app.alert.AlertRules.Severity;
import com.paintball.app.alert.AlertRules.Type;
import com.paintball.app.booking.Booking;
import com.paintball.app.booking.BookingStatus;
import com.paintball.app.employee.Employee;
import com.paintball.app.employee.EmployeeExclusion;
import com.paintball.app.venue.Venue;
import com.paintball.app.venue.VenueBlock;

class AlertRulesTest {

    private static final LocalDate TODAY = LocalDate.of(2026, 10, 29);
    private static final Instant NOW = Instant.parse("2026-10-29T10:00:00Z");

    private final Venue szeged = venue(1, "Boszorkánysziget", 15);
    private final Employee anna = employee(20, "Nagy Anna");

    @Test
    void longPendingAfter48Hours() {
        Booking fresh = pending(1, TODAY.plusDays(20), "2026-10-28T10:00:00Z");
        Booking old = pending(2, TODAY.plusDays(20), "2026-10-26T09:00:00Z");

        List<Alert> alerts = compute(List.of(fresh, old));

        assertThat(alerts).extracting(Alert::type, Alert::bookingId).containsExactly(
                org.assertj.core.groups.Tuple.tuple(Type.LONG_PENDING, 2L));
        assertThat(alerts.get(0).severity()).isEqualTo(Severity.WARN);
    }

    @Test
    void pendingGameWithinAWeekIsUrgent() {
        assertThat(compute(List.of(pending(1, TODAY.plusDays(3), "2026-10-28T10:00:00Z"))))
                .extracting(Alert::type).containsExactly(Type.PENDING_SOON);
    }

    @Test
    void acceptedGameWithinSevenDaysNeedsCarAndStaff() {
        Booking tomorrow = accepted(1, TODAY.plusDays(1));
        Booking nextWeek = accepted(2, TODAY.plusDays(5));
        nextWeek.setCar(car(10, "ABC-123", 5));
        Booking later = accepted(3, TODAY.plusDays(10));
        Booking ready = accepted(4, TODAY.plusDays(2));
        ready.setCar(car(10, "ABC-123", 5));
        ready.setEmployees(Set.of(anna));

        List<Alert> alerts = compute(List.of(tomorrow, nextWeek, later, ready));

        assertThat(alerts).extracting(Alert::bookingId).containsExactly(1L, 2L);
        assertThat(alerts.get(0).severity()).isEqualTo(Severity.DANGER);
        assertThat(alerts.get(0).detail()).contains("autó és dolgozó");
        assertThat(alerts.get(1).severity()).isEqualTo(Severity.WARN);
        assertThat(alerts.get(1).detail()).contains("nincs dolgozó");
    }

    @Test
    void excludedEmployeeAssigned() {
        Booking b = accepted(1, TODAY.plusDays(20));
        b.setCar(car(10, "ABC-123", 5));
        b.setEmployees(Set.of(anna));
        EmployeeExclusion away = new EmployeeExclusion();
        away.setEmployee(anna);
        away.setDateFrom(TODAY.plusDays(19));
        away.setDateTo(TODAY.plusDays(21));
        away.setReason("szabadság");

        List<Alert> alerts = AlertRules.compute(List.of(b), List.of(away), List.of(), NOW, TODAY);

        assertThat(alerts).extracting(Alert::type).containsExactly(Type.EMPLOYEE_AWAY);
        assertThat(alerts.get(0).detail()).contains("Nagy Anna", "szabadság");
    }

    @Test
    void bookingOnBlockedVenue() {
        Booking b = pending(1, TODAY.plusDays(20), "2026-10-28T10:00:00Z");
        VenueBlock block = new VenueBlock();
        block.setVenue(szeged);
        block.setStartsAt(TODAY.plusDays(20).atTime(11, 0));
        block.setEndsAt(TODAY.plusDays(20).atTime(18, 0));

        List<Alert> alerts = AlertRules.compute(List.of(b), List.of(), List.of(block), NOW, TODAY);

        assertThat(alerts).extracting(Alert::type).containsExactly(Type.VENUE_BLOCKED);
    }

    @Test
    void ignoresPastRejectedAndCancelledBookings() {
        Booking past = accepted(1, TODAY.minusDays(1));
        Booking rejected = game(2, szeged, TODAY.plusDays(1), "10:00", "12:00", BookingStatus.REJECTED);
        Booking cancelled = game(3, szeged, TODAY.plusDays(1), "10:00", "12:00", BookingStatus.CANCELLED);

        assertThat(compute(List.of(past, rejected, cancelled))).isEmpty();
    }

    private List<Alert> compute(List<Booking> bookings) {
        return AlertRules.compute(bookings, List.of(), List.of(), NOW, TODAY);
    }

    private Booking pending(long id, LocalDate date, String createdAt) {
        Booking b = game(id, szeged, date, "10:00", "12:00", BookingStatus.PENDING);
        b.setCreatedAt(Instant.parse(createdAt));
        return b;
    }

    private Booking accepted(long id, LocalDate date) {
        return game(id, szeged, date, "10:00", "12:00", BookingStatus.ACCEPTED);
    }
}
