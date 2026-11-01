package com.paintball.app.schedule;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.paintball.app.booking.Booking;
import com.paintball.app.booking.BookingRepository;
import com.paintball.app.booking.BookingStatus;
import com.paintball.app.car.Car;
import com.paintball.app.car.CarRepository;
import com.paintball.app.employee.Employee;
import com.paintball.app.employee.EmployeeExclusion;
import com.paintball.app.employee.EmployeeExclusionRepository;
import com.paintball.app.employee.EmploymentType;

/** The plan of one day: what each car does when, and who works from when to when. */
@Service
public class ScheduleService {

    private final BookingRepository bookingRepository;
    private final CarRepository carRepository;
    private final EmployeeExclusionRepository exclusionRepository;

    public ScheduleService(BookingRepository bookingRepository, CarRepository carRepository,
            EmployeeExclusionRepository exclusionRepository) {
        this.bookingRepository = bookingRepository;
        this.carRepository = carRepository;
        this.exclusionRepository = exclusionRepository;
    }

    @Transactional(readOnly = true)
    public DaySchedule forDay(LocalDate date) {
        List<Booking> games = bookingRepository.findByPlayDateAndStatusIn(date, Set.of(BookingStatus.ACCEPTED));

        List<CarDay> cars = new ArrayList<>();
        for (Car car : carRepository.findAllByOrderByActiveDescPlateAsc()) {
            List<Booking> carGames = games.stream()
                    .filter(g -> g.getCar() != null && Objects.equals(g.getCar().getId(), car.getId()))
                    .toList();
            if (car.isActive() || !carGames.isEmpty()) {
                cars.add(new CarDay(car.getId(), car.getPlate(), car.getSeats(), ScheduleRules.segments(carGames)));
            }
        }

        Map<Long, List<Booking>> byEmployee = new LinkedHashMap<>();
        Map<Long, Employee> employees = new LinkedHashMap<>();
        for (Booking game : games) {
            for (Employee e : game.getEmployees()) {
                employees.put(e.getId(), e);
                byEmployee.computeIfAbsent(e.getId(), id -> new ArrayList<>()).add(game);
            }
        }
        Set<Long> away = employees.isEmpty() ? Set.of()
                : exclusionRepository.findCovering(employees.keySet(), date).stream()
                        .map(EmployeeExclusion::getEmployee)
                        .map(Employee::getId)
                        .collect(Collectors.toSet());
        List<StaffDay> staff = employees.values().stream()
                .map(e -> staffDay(e, byEmployee.get(e.getId()), away.contains(e.getId())))
                .sorted(Comparator.comparing(StaffDay::from).thenComparing(StaffDay::name))
                .toList();

        List<GameRef> unassigned = games.stream()
                .filter(g -> g.getCar() == null || g.getEmployees().isEmpty())
                .sorted(Comparator.comparing(Booking::getStartTime))
                .map(g -> new GameRef(g.getId(), g.getVenue().getName(), g.getStartTime(), g.getEndTime(),
                        g.getCar() != null, !g.getEmployees().isEmpty()))
                .toList();

        return new DaySchedule(date, cars, staff, unassigned);
    }

    private static StaffDay staffDay(Employee e, List<Booking> games, boolean excluded) {
        List<ScheduleRules.Segment> segments = ScheduleRules.segments(games);
        List<String> plates = games.stream()
                .filter(g -> g.getCar() != null)
                .map(g -> g.getCar().getPlate())
                .distinct()
                .toList();
        List<String> venues = games.stream().map(g -> g.getVenue().getName()).distinct().toList();
        return new StaffDay(e.getId(), e.getName(), e.getPhone(), e.getEmploymentType(),
                segments.get(0).start(), segments.get(segments.size() - 1).end(), plates, venues, excluded);
    }

    public record DaySchedule(LocalDate date, List<CarDay> cars, List<StaffDay> staff, List<GameRef> unassigned) {
    }

    public record CarDay(Long carId, String plate, int seats, List<ScheduleRules.Segment> segments) {
    }

    /** One employee's working day: from leaving the base until getting back. */
    public record StaffDay(Long employeeId, String name, String phone, EmploymentType employmentType,
            LocalTime from, LocalTime to, List<String> cars, List<String> venues, boolean excluded) {
    }

    /** An accepted game of the day that still lacks a car or staff. */
    public record GameRef(Long bookingId, String venueName, LocalTime startTime, LocalTime endTime, boolean hasCar,
            boolean hasStaff) {
    }
}
