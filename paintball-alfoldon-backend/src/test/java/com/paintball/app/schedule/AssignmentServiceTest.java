package com.paintball.app.schedule;

import static com.paintball.app.schedule.ScheduleTestData.DAY;
import static com.paintball.app.schedule.ScheduleTestData.car;
import static com.paintball.app.schedule.ScheduleTestData.employee;
import static com.paintball.app.schedule.ScheduleTestData.game;
import static com.paintball.app.schedule.ScheduleTestData.venue;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.paintball.app.booking.Booking;
import com.paintball.app.booking.BookingRepository;
import com.paintball.app.booking.BookingStatus;
import com.paintball.app.car.Car;
import com.paintball.app.common.BookingRuleException;
import com.paintball.app.common.ConflictException;
import com.paintball.app.employee.Employee;
import com.paintball.app.employee.EmployeeExclusion;
import com.paintball.app.employee.EmployeeExclusionRepository;
import com.paintball.app.employee.EmployeeRepository;
import com.paintball.app.venue.Venue;

class AssignmentServiceTest {

    private final BookingRepository bookingRepository = mock(BookingRepository.class);
    private final EmployeeRepository employeeRepository = mock(EmployeeRepository.class);
    private final EmployeeExclusionRepository exclusionRepository = mock(EmployeeExclusionRepository.class);
    private AssignmentService service;

    private final Venue szeged = venue(1, "Boszorkánysziget", 15);
    private final Car van = car(10, "ABC-123", 3);
    private final Employee anna = employee(20, "Nagy Anna");
    private final Employee peti = employee(21, "Tóth Péter");
    private final List<Booking> sameDay = new ArrayList<>();
    private Booking booking;

    @BeforeEach
    void setUp() {
        Clock clock = Clock.fixed(Instant.parse("2026-10-29T10:00:00Z"), ZoneId.of("Europe/Budapest"));
        service = new AssignmentService(bookingRepository, employeeRepository, exclusionRepository, clock);

        booking = game(1, szeged, "10:00", "12:00");
        booking.setCar(van);
        sameDay.add(booking);
        when(bookingRepository.findWithDetailsById(1L)).thenReturn(Optional.of(booking));
        when(bookingRepository.findByPlayDateAndStatusIn(eq(DAY), anyCollection())).thenReturn(sameDay);
        when(employeeRepository.findAllById(any())).thenAnswer(call -> {
            Iterable<Long> ids = call.getArgument(0);
            List<Employee> found = new ArrayList<>();
            ids.forEach(id -> found.add(id == 20L ? anna : peti));
            return found;
        });
    }

    @Test
    void assignsStaffAndKeepsTheAutomaticCar() {
        Booking result = service.assign(1L, List.of(20L, 21L));

        assertThat(result.getCar()).isSameAs(van);
        assertThat(result.getEmployees()).containsExactlyInAnyOrder(anna, peti);
        assertThat(result.getUpdatedAt()).isEqualTo(Instant.parse("2026-10-29T10:00:00Z"));
    }

    @Test
    void clearsStaff() {
        booking.setEmployees(Set.of(anna));

        assertThat(service.assign(1L, List.of()).getEmployees()).isEmpty();
    }

    @Test
    void refusesEmployeeWorkingElsewhere() {
        Booking other = game(2, szeged, "11:00", "13:00");
        other.setEmployees(Set.of(peti));
        sameDay.add(other);

        assertThatThrownBy(() -> service.assign(1L, List.of(21L)))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Tóth Péter");
    }

    @Test
    void refusesEmployeeWhoIsAway() {
        EmployeeExclusion away = new EmployeeExclusion();
        away.setEmployee(anna);
        away.setDateFrom(DAY);
        away.setDateTo(DAY.plusDays(3));
        away.setReason("szabadság");
        when(exclusionRepository.findCovering(any(), eq(DAY))).thenReturn(List.of(away));

        assertThatThrownBy(() -> service.assign(1L, List.of(20L)))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Nagy Anna")
                .hasMessageContaining("szabadság");
    }

    @Test
    void refusesMoreStaffThanSeats() {
        booking.setCar(car(12, "KIS-001", 1));

        assertThatThrownBy(() -> service.assign(1L, List.of(20L, 21L)))
                .isInstanceOf(BookingRuleException.class);
    }

    @Test
    void refusesRejectedBooking() {
        booking.setStatus(BookingStatus.REJECTED);

        assertThatThrownBy(() -> service.assign(1L, List.of())).isInstanceOf(ConflictException.class);
    }
}
