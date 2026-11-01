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
import com.paintball.app.car.CarRepository;
import com.paintball.app.common.BookingRuleException;
import com.paintball.app.common.ConflictException;
import com.paintball.app.employee.Employee;
import com.paintball.app.employee.EmployeeExclusion;
import com.paintball.app.employee.EmployeeExclusionRepository;
import com.paintball.app.employee.EmployeeRepository;
import com.paintball.app.venue.Venue;

class AssignmentServiceTest {

    private final BookingRepository bookingRepository = mock(BookingRepository.class);
    private final CarRepository carRepository = mock(CarRepository.class);
    private final EmployeeRepository employeeRepository = mock(EmployeeRepository.class);
    private final EmployeeExclusionRepository exclusionRepository = mock(EmployeeExclusionRepository.class);
    private AssignmentService service;

    private final Venue szeged = venue(1, "Boszorkánysziget", 15);
    private final Venue szolnok = venue(3, "Tiszaliget", 135);
    private final Car van = car(10, "ABC-123", 3);
    private final Employee anna = employee(20, "Nagy Anna");
    private final Employee peti = employee(21, "Tóth Péter");
    private final List<Booking> sameDay = new ArrayList<>();
    private Booking booking;

    @BeforeEach
    void setUp() {
        Clock clock = Clock.fixed(Instant.parse("2026-10-29T10:00:00Z"), ZoneId.of("Europe/Budapest"));
        service = new AssignmentService(bookingRepository, carRepository, employeeRepository, exclusionRepository,
                clock);

        booking = game(1, szeged, "10:00", "12:00");
        sameDay.add(booking);
        when(bookingRepository.findWithDetailsById(1L)).thenReturn(Optional.of(booking));
        when(bookingRepository.findByPlayDateAndStatusIn(eq(DAY), anyCollection())).thenReturn(sameDay);
        when(carRepository.findById(10L)).thenReturn(Optional.of(van));
        when(employeeRepository.findAllById(any())).thenAnswer(call -> {
            Iterable<Long> ids = call.getArgument(0);
            List<Employee> found = new ArrayList<>();
            ids.forEach(id -> found.add(id == 20L ? anna : peti));
            return found;
        });
    }

    @Test
    void assignsCarAndStaff() {
        Booking result = service.assign(1L, 10L, List.of(20L, 21L));

        assertThat(result.getCar()).isSameAs(van);
        assertThat(result.getEmployees()).containsExactlyInAnyOrder(anna, peti);
        assertThat(result.getUpdatedAt()).isEqualTo(Instant.parse("2026-10-29T10:00:00Z"));
    }

    @Test
    void clearsAssignment() {
        booking.setCar(van);
        booking.setEmployees(Set.of(anna));

        Booking result = service.assign(1L, null, List.of());

        assertThat(result.getCar()).isNull();
        assertThat(result.getEmployees()).isEmpty();
    }

    @Test
    void refusesCarThatIsElsewhereIncludingTravelTime() {
        // After 12:00 in Szeged the car needs 30 + 135 + 45 minutes before a game in Szolnok: 14:00 is too early.
        Booking other = game(2, szolnok, "14:00", "16:00");
        other.setCar(van);
        sameDay.add(other);

        assertThatThrownBy(() -> service.assign(1L, 10L, List.of()))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("ABC-123")
                .hasMessageContaining("Tiszaliget");
    }

    @Test
    void ignoresGamesOfOtherCarsAndStaff() {
        Booking other = game(2, szolnok, "12:00", "14:00");
        other.setCar(car(11, "XYZ-999", 5));
        other.setEmployees(Set.of(peti));
        sameDay.add(other);

        assertThat(service.assign(1L, 10L, List.of(20L)).getCar()).isSameAs(van);
    }

    @Test
    void refusesEmployeeWorkingElsewhere() {
        Booking other = game(2, szeged, "11:00", "13:00");
        other.setEmployees(Set.of(peti));
        sameDay.add(other);

        assertThatThrownBy(() -> service.assign(1L, null, List.of(21L)))
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

        assertThatThrownBy(() -> service.assign(1L, 10L, List.of(20L)))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Nagy Anna")
                .hasMessageContaining("szabadság");
    }

    @Test
    void refusesMoreStaffThanSeats() {
        Car small = car(12, "KIS-001", 1);
        when(carRepository.findById(12L)).thenReturn(Optional.of(small));

        assertThatThrownBy(() -> service.assign(1L, 12L, List.of(20L, 21L)))
                .isInstanceOf(BookingRuleException.class);
    }

    @Test
    void refusesInactiveCarAndRejectedBooking() {
        van.setActive(false);
        assertThatThrownBy(() -> service.assign(1L, 10L, List.of())).isInstanceOf(ConflictException.class);

        van.setActive(true);
        booking.setStatus(BookingStatus.REJECTED);
        assertThatThrownBy(() -> service.assign(1L, 10L, List.of())).isInstanceOf(ConflictException.class);
    }
}
