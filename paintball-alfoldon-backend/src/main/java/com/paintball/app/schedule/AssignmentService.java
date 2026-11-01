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
import com.paintball.app.car.CarRepository;
import com.paintball.app.common.BookingRuleException;
import com.paintball.app.common.ConflictException;
import com.paintball.app.common.NotFoundException;
import com.paintball.app.employee.Employee;
import com.paintball.app.employee.EmployeeExclusion;
import com.paintball.app.employee.EmployeeExclusionRepository;
import com.paintball.app.employee.EmployeeRepository;

/** Assigns a car and staff to a game (beosztás), refusing clashes and employees who are away that day. */
@Service
public class AssignmentService {

    private static final DateTimeFormatter HM = DateTimeFormatter.ofPattern("H:mm");

    private final BookingRepository bookingRepository;
    private final CarRepository carRepository;
    private final EmployeeRepository employeeRepository;
    private final EmployeeExclusionRepository exclusionRepository;
    private final Clock clock;

    public AssignmentService(BookingRepository bookingRepository, CarRepository carRepository,
            EmployeeRepository employeeRepository, EmployeeExclusionRepository exclusionRepository, Clock clock) {
        this.bookingRepository = bookingRepository;
        this.carRepository = carRepository;
        this.employeeRepository = employeeRepository;
        this.exclusionRepository = exclusionRepository;
        this.clock = clock;
    }

    /**
     * Replaces the assignment of a booking. {@code carId} may be null and {@code employeeIds} empty,
     * which clears that part of the assignment.
     */
    @Transactional
    public Booking assign(Long bookingId, Long carId, List<Long> employeeIds) {
        Booking booking = bookingRepository.findWithDetailsById(bookingId)
                .orElseThrow(() -> new NotFoundException("Nincs ilyen foglalás: " + bookingId));
        if (!BookingStatus.OCCUPYING.contains(booking.getStatus())) {
            throw new ConflictException("Elutasított vagy lemondott foglaláshoz nem lehet beosztást rendelni.");
        }

        Car car = carId == null ? null : findCar(carId, booking);
        Set<Employee> employees = findEmployees(employeeIds == null ? List.of() : employeeIds, booking);
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
        if (car != null) {
            List<Booking> carGames = sameDay.stream()
                    .filter(b -> b.getCar() != null && Objects.equals(b.getCar().getId(), car.getId()))
                    .toList();
            ScheduleRules.firstClash(booking, carGames).ifPresent(other -> {
                throw new ConflictException("A(z) " + car.getPlate() + " autó ekkor már máshol van: "
                        + describe(other) + ".");
            });
        }
        for (Employee employee : employees) {
            List<Booking> theirGames = sameDay.stream()
                    .filter(b -> b.getEmployees().stream().anyMatch(e -> Objects.equals(e.getId(), employee.getId())))
                    .toList();
            ScheduleRules.firstClash(booking, theirGames).ifPresent(other -> {
                throw new ConflictException(employee.getName() + " ekkor már máshol dolgozik: " + describe(other)
                        + ".");
            });
        }

        booking.setCar(car);
        booking.setEmployees(new HashSet<>(employees));
        booking.setUpdatedAt(Instant.now(clock));
        return booking;
    }

    private Car findCar(Long carId, Booking booking) {
        Car car = carRepository.findById(carId).orElseThrow(() -> new NotFoundException("Nincs ilyen autó: " + carId));
        boolean alreadyAssigned = booking.getCar() != null && booking.getCar().getId().equals(carId);
        if (!car.isActive() && !alreadyAssigned) {
            throw new ConflictException("A(z) " + car.getPlate() + " autó nem aktív.");
        }
        return car;
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
