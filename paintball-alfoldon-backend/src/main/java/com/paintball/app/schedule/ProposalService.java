package com.paintball.app.schedule;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.paintball.app.booking.Booking;
import com.paintball.app.booking.BookingStatus;
import com.paintball.app.car.Car;
import com.paintball.app.employee.Employee;
import com.paintball.app.employee.EmployeeExclusion;
import com.paintball.app.employee.EmployeeExclusionRepository;
import com.paintball.app.employee.EmployeeRepository;
import com.paintball.app.employee.EmploymentType;

/**
 * Proposes the staff of a day: who drives each car (one employee per car). The cars themselves are
 * assigned automatically ({@link CrewCapacity#assignCars}), the staff only when the admin applies this.
 * Staff the admin already assigned are kept.
 */
@Service
public class ProposalService {

    private final CrewCapacity crewCapacity;
    private final EmployeeRepository employeeRepository;
    private final EmployeeExclusionRepository exclusionRepository;
    private final AssignmentService assignmentService;

    public ProposalService(CrewCapacity crewCapacity, EmployeeRepository employeeRepository,
            EmployeeExclusionRepository exclusionRepository, AssignmentService assignmentService) {
        this.crewCapacity = crewCapacity;
        this.employeeRepository = employeeRepository;
        this.exclusionRepository = exclusionRepository;
        this.assignmentService = assignmentService;
    }

    @Transactional(readOnly = true)
    public Proposal propose(LocalDate date) {
        CrewCapacity.Day day = crewCapacity.day(date);
        if (day.games().isEmpty()) {
            return new Proposal(date, true, List.of());
        }
        Optional<CrewPlanner.Plan> plan = day.plan();
        if (plan.isEmpty()) {
            return new Proposal(date, false, List.of());
        }

        Map<Long, Employee> driverOfCar = chooseDrivers(plan.get(), date);
        List<ProposedGame> games = new ArrayList<>();
        for (CrewPlanner.CarPlan carPlan : plan.get().cars()) {
            Car car = carPlan.car();
            Employee driver = driverOfCar.get(car.getId());
            for (Booking game : carPlan.games()) {
                List<StaffRef> staff = game.getEmployees().isEmpty()
                        ? (driver == null ? List.of() : List.of(StaffRef.of(driver)))
                        : game.getEmployees().stream().map(StaffRef::of)
                                .sorted(Comparator.comparing(StaffRef::name)).toList();
                boolean staffChanged = game.getEmployees().isEmpty() && !staff.isEmpty();
                games.add(new ProposedGame(game.getId(), game.getVenue().getName(), game.getStartTime(),
                        game.getEndTime(), game.getStatus(), car.getId(), car.getPlate(), staff,
                        staffChanged));
            }
        }
        games.sort(Comparator.comparing(ProposedGame::startTime).thenComparing(ProposedGame::plate));
        return new Proposal(date, true, games);
    }

    /** Saves the given assignments together: either all of them or, on the first refusal, none. */
    @Transactional
    public void apply(List<ApplyItem> items) {
        for (ApplyItem item : items) {
            assignmentService.assign(item.bookingId(), item.employeeIds());
        }
    }

    /**
     * One driver for each car that has games. A car keeps the employee already assigned to one of its
     * games; the others get someone free that day who is not in another car, full-time staff first.
     */
    private Map<Long, Employee> chooseDrivers(CrewPlanner.Plan plan, LocalDate date) {
        Map<Long, Employee> drivers = new HashMap<>();
        Set<Long> taken = new HashSet<>();
        for (CrewPlanner.CarPlan carPlan : plan.cars()) {
            for (Booking game : carPlan.games()) {
                game.getEmployees().forEach(e -> taken.add(e.getId()));
                if (!drivers.containsKey(carPlan.car().getId()) && !game.getEmployees().isEmpty()) {
                    drivers.put(carPlan.car().getId(), game.getEmployees().iterator().next());
                }
            }
        }

        List<Employee> active = employeeRepository.findAllByOrderByActiveDescNameAsc().stream()
                .filter(Employee::isActive)
                .toList();
        Set<Long> away = active.isEmpty() ? Set.of()
                : exclusionRepository.findCovering(active.stream().map(Employee::getId).toList(), date).stream()
                        .map(EmployeeExclusion::getEmployee)
                        .map(Employee::getId)
                        .collect(Collectors.toSet());
        List<Employee> free = active.stream()
                .filter(e -> !away.contains(e.getId()) && !taken.contains(e.getId()))
                .sorted(Comparator.comparing((Employee e) -> e.getEmploymentType() != EmploymentType.FULL_TIME)
                        .thenComparing(Employee::getName))
                .collect(Collectors.toCollection(ArrayList::new));

        for (CrewPlanner.CarPlan carPlan : plan.cars()) {
            if (!carPlan.games().isEmpty() && !drivers.containsKey(carPlan.car().getId()) && !free.isEmpty()) {
                drivers.put(carPlan.car().getId(), free.remove(0));
            }
        }
        return drivers;
    }

    /**
     * @param fits  false when the games of the day cannot all be done with the cars (overbooked);
     *              then {@code games} is empty
     * @param games every pending and accepted game of the day with its proposed car and staff
     */
    public record Proposal(LocalDate date, boolean fits, List<ProposedGame> games) {
    }

    /** {@code changed} is true when applying the proposal would change this game's assignment. */
    public record ProposedGame(Long bookingId, String venueName, LocalTime startTime, LocalTime endTime,
            BookingStatus status, Long carId, String plate, List<StaffRef> staff, boolean changed) {
    }

    public record StaffRef(Long id, String name) {

        static StaffRef of(Employee e) {
            return new StaffRef(e.getId(), e.getName());
        }
    }

    public record ApplyItem(Long bookingId, List<Long> employeeIds) {
    }
}
