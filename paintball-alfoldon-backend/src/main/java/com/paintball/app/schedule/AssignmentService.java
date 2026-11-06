package com.paintball.app.schedule;

import java.time.Clock;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.paintball.app.booking.Booking;
import com.paintball.app.booking.BookingRepository;
import com.paintball.app.booking.BookingStatus;
import com.paintball.app.car.Car;
import com.paintball.app.common.BookingRuleException;
import com.paintball.app.common.ConflictException;
import com.paintball.app.common.NotFoundException;
import com.paintball.app.employee.Employee;
import com.paintball.app.employee.EmployeeExclusion;
import com.paintball.app.employee.EmployeeExclusionRepository;
import com.paintball.app.employee.EmployeeRepository;

/**
 * Assigns the staff of a game (beosztás), refusing clashes and employees who are away that day.
 * The car is not chosen here: {@link CrewCapacity#assignCars} sets it automatically.
 */
@Service
public class AssignmentService {

    private static final DateTimeFormatter HM = DateTimeFormatter.ofPattern("H:mm");

    private final BookingRepository bookingRepository;
    private final EmployeeRepository employeeRepository;
    private final EmployeeExclusionRepository exclusionRepository;
    private final Clock clock;

    public AssignmentService(BookingRepository bookingRepository, EmployeeRepository employeeRepository,
            EmployeeExclusionRepository exclusionRepository, Clock clock) {
        this.bookingRepository = bookingRepository;
        this.employeeRepository = employeeRepository;
        this.exclusionRepository = exclusionRepository;
        this.clock = clock;
    }

    /** Replaces the staff of a game; an empty list clears it. */
    @Transactional
    public Booking assign(Long bookingId, List<Long> employeeIds) {
        Booking booking = bookingRepository.findWithDetailsById(bookingId)
                .orElseThrow(() -> new NotFoundException("Nincs ilyen foglalás: " + bookingId));
        if (!BookingStatus.OCCUPYING.contains(booking.getStatus())) {
            throw new ConflictException("Elutasított vagy lemondott foglaláshoz nem lehet beosztást rendelni.");
        }

        Set<Employee> employees = findEmployees(employeeIds == null ? List.of() : employeeIds, booking);
        Car car = booking.getCar();
        if (car != null && employees.size() > car.getSeats()) {
            throw new BookingRuleException("A(z) " + car.getPlate() + " autóban csak " + car.getSeats()
                    + " hely van, de " + employees.size() + " dolgozót osztottál be.");
        }

        if (!employees.isEmpty()) {
            List<Long> ids = employees.stream().map(Employee::getId).toList();
            List<EmployeeExclusion> away = exclusionRepository.findCovering(ids, booking.getPlayDate());
            if (!away.isEmpty()) {
                EmployeeExclusion x = away.get(0);
                throw new ConflictException(x.getEmployee().getName() + " ezen a napon nem elérhető"
                        + (x.getReason() == null ? "." : " (" + x.getReason() + ")."));
            }
        }

        List<Booking> sameDay = bookingRepository.findByPlayDateAndStatusIn(booking.getPlayDate(),
                BookingStatus.OCCUPYING);
        for (Employee employee : employees) {
            List<Booking> theirGames = sameDay.stream()
                    .filter(b -> b.getEmployees().stream().anyMatch(e -> Objects.equals(e.getId(), employee.getId())))
                    .toList();
            ScheduleRules.firstClash(booking, theirGames).ifPresent(other -> {
                throw new ConflictException(employee.getName() + " ekkor már máshol dolgozik: " + describe(other)
                        + ".");
            });
        }

        booking.setEmployees(new HashSet<>(employees));
        booking.setUpdatedAt(Instant.now(clock));
        return booking;
    }

    private Set<Employee> findEmployees(List<Long> ids, Booking booking) {
        Set<Long> unique = new LinkedHashSet<>(ids);
        List<Employee> found = employeeRepository.findAllById(unique);
        if (found.size() != unique.size()) {
            throw new NotFoundException("Ismeretlen alkalmazott a beosztásban.");
        }
        for (Employee e : found) {
            boolean alreadyAssigned = booking.getEmployees().stream().anyMatch(x -> x.getId().equals(e.getId()));
            if (!e.isActive() && !alreadyAssigned) {
                throw new ConflictException(e.getName() + " nem aktív alkalmazott.");
            }
        }
        return new LinkedHashSet<>(found);
    }

    private static String describe(Booking other) {
        return other.getVenue().getName() + ", " + HM.format(other.getStartTime()) + "–"
                + HM.format(other.getEndTime());
    }
}
