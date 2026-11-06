package com.paintball.app.schedule;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.paintball.app.booking.Booking;
import com.paintball.app.booking.BookingRepository;
import com.paintball.app.booking.BookingStatus;
import com.paintball.app.car.Car;
import com.paintball.app.car.CarRepository;
import com.paintball.app.venue.Venue;

/**
 * The cars of a day. There are as many crews as active cars (one employee drives each car), pending
 * and accepted bookings both count, and every game gets its car automatically from the best split
 * ({@link CrewPlanner}): nobody picks cars by hand.
 */
@Service
public class CrewCapacity {

    private final BookingRepository bookingRepository;
    private final CarRepository carRepository;
    private final Clock clock;

    public CrewCapacity(BookingRepository bookingRepository, CarRepository carRepository, Clock clock) {
        this.bookingRepository = bookingRepository;
        this.carRepository = carRepository;
        this.clock = clock;
    }

    /** The day's games and cars, loaded once for checking several start times. */
    public Day day(LocalDate date) {
        return new Day(bookingRepository.findByPlayDateAndStatusIn(date, BookingStatus.OCCUPYING),
                carRepository.findByActiveTrueOrderByPlateAsc());
    }

    /** Same as {@link #day} but locks the cars until the transaction ends; use it when saving a booking. */
    public Day dayForUpdate(LocalDate date) {
        List<Car> cars = carRepository.findActiveForUpdate();
        return new Day(bookingRepository.findByPlayDateAndStatusIn(date, BookingStatus.OCCUPYING), cars);
    }

    /**
     * Gives every pending and accepted game of the day its car from the best split. Called whenever the
     * games of a day change. When the day cannot be split (e.g. a car was deactivated) nothing changes,
     * and the dashboard shows the day as overbooked.
     */
    @Transactional
    public void assignCars(LocalDate date) {
        Day day = dayForUpdate(date);
        day.plan().ifPresent(plan -> {
            Instant now = Instant.now(clock);
            for (CrewPlanner.CarPlan carPlan : plan.cars()) {
                for (Booking game : carPlan.games()) {
                    if (!CrewPlanner.sameCar(game.getCar(), carPlan.car())) {
                        game.setCar(carPlan.car());
                        game.setUpdatedAt(now);
                    }
                }
            }
        });
    }

    /** {@link #assignCars} for today and every later day with games, e.g. after the cars changed. */
    @Transactional
    public void assignCarsFromToday() {
        for (LocalDate date : bookingRepository.findPlayDatesFrom(LocalDate.now(clock), BookingStatus.OCCUPYING)) {
            assignCars(date);
        }
    }

    public record Day(List<Booking> games, List<Car> cars) {

        /** True when another game of the day uses {@code venue} at any time in [start, end). */
        public boolean venueBusy(Venue venue, LocalTime start, LocalTime end) {
            return games.stream()
                    .filter(g -> g.getVenue() == venue
                            || (venue.getId() != null && venue.getId().equals(g.getVenue().getId())))
                    .anyMatch(g -> g.getStartTime().isBefore(end) && g.getEndTime().isAfter(start));
        }

        /** The best plan of the day as it is, or empty when it is already overbooked. */
        public Optional<CrewPlanner.Plan> plan() {
            return CrewPlanner.plan(games, cars);
        }

        /** The best plan with one more game at {@code venue} from {@code start} to {@code end}. */
        public Optional<CrewPlanner.Plan> planWith(Venue venue, LocalDate date, LocalTime start, LocalTime end) {
            return planWith(venue, date, start, end, cars);
        }

        /** Like {@link #planWith(Venue, LocalDate, LocalTime, LocalTime)} but only with {@code onlyCars}. */
        public Optional<CrewPlanner.Plan> planWith(Venue venue, LocalDate date, LocalTime start, LocalTime end,
                List<Car> onlyCars) {
            Booking candidate = new Booking();
            candidate.setVenue(venue);
            candidate.setPlayDate(date);
            candidate.setStartTime(start);
            candidate.setEndTime(end);
            candidate.setStatus(BookingStatus.PENDING);
            List<Booking> all = new ArrayList<>(games);
            all.add(candidate);
            return CrewPlanner.plan(all, onlyCars);
        }
    }
}
