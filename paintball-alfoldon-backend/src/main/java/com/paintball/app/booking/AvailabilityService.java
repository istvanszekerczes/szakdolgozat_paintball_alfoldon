package com.paintball.app.booking;

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

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.paintball.app.car.Car;
import com.paintball.app.common.NotFoundException;
import com.paintball.app.schedule.CrewCapacity;
import com.paintball.app.schedule.CrewPlanner;
import com.paintball.app.venue.Venue;
import com.paintball.app.venue.VenueBlock;
import com.paintball.app.venue.VenueBlockRepository;
import com.paintball.app.venue.VenueRepository;

/**
 * The start times offered on one venue and day:
 * <ul>
 * <li>no game yet that day: the fixed slots, all free;</li>
 * <li>some cars already work that day: the fixed slots stay bookable while a free car is left, and
 * the times that fit into a working car's day are recommended, plus up to two adjusted (half-hour)
 * start times packed right before or after that car's games;</li>
 * <li>every car works: only times that fit into one of their days can be booked.</li>
 * </ul>
 */
@Service
public class AvailabilityService {

    /** Adjusted start times offered next to the fixed slots. */
    private static final int MAX_ADJUSTED_TIMES = 2;

    private final VenueRepository venueRepository;
    private final VenueBlockRepository venueBlockRepository;
    private final CrewCapacity crewCapacity;
    private final BookingRules rules;

    public AvailabilityService(VenueRepository venueRepository, VenueBlockRepository venueBlockRepository,
            CrewCapacity crewCapacity, BookingRules rules) {
        this.venueRepository = venueRepository;
        this.venueBlockRepository = venueBlockRepository;
        this.crewCapacity = crewCapacity;
        this.rules = rules;
    }

    @Transactional(readOnly = true)
    public AvailabilityResponse forDay(String venueSlug, LocalDate date) {
        Venue venue = venueRepository.findBySlug(venueSlug)
                .filter(Venue::isActive)
                .orElseThrow(() -> new NotFoundException("Nincs ilyen pálya: " + venueSlug));
        boolean bookable = rules.isBookableDate(date);
        CrewCapacity.Day day = crewCapacity.day(date);
        // Blocks (pályazárolás) make every start time they touch unavailable.
        List<VenueBlock> blocks = venueBlockRepository.findOverlapping(venue, date.atStartOfDay(),
                date.plusDays(1).atStartOfDay());
        Optional<CrewPlanner.Plan> today = day.plan();
        List<Car> working = today.map(p -> p.cars().stream()
                .filter(c -> !c.games().isEmpty())
                .map(CrewPlanner.CarPlan::car)
                .toList()).orElse(List.of());
        int workToday = today.map(CrewPlanner.Plan::workMinutes).orElse(0);

        Set<LocalTime> available = new HashSet<>();
        // Start times a working car can take, with the working minutes they add to its day.
        Map<LocalTime, Integer> joins = new HashMap<>();
        if (bookable) {
            for (LocalTime start : rules.startTimes()) {
                LocalTime end = rules.slotEnd(start);
                if (day.venueBusy(venue, start, end) || blocks.stream().anyMatch(b -> b.overlaps(date, start, end))) {
                    continue;
                }
                if (day.planWith(venue, date, start, end).isPresent()) {
                    available.add(start);
                }
                if (!working.isEmpty()) {
                    day.planWith(venue, date, start, end, working)
                            .ifPresent(p -> joins.put(start, p.workMinutes() - workToday));
                }
            }
        }

        // Adjusted times: right before or after a working car's games, i.e. the ends of each run of
        // half hours that car can take. The fixed slots are listed anyway.
        List<LocalTime> starts = rules.startTimes();
        List<LocalTime> adjusted = new ArrayList<>();
        for (int i = 0; i < starts.size(); i++) {
            LocalTime t = starts.get(i);
            boolean edge = (i == 0 || !joins.containsKey(starts.get(i - 1)))
                    || (i == starts.size() - 1 || !joins.containsKey(starts.get(i + 1)));
            if (joins.containsKey(t) && edge && !rules.slotStarts().contains(t)) {
                adjusted.add(t);
            }
        }
        Set<LocalTime> offeredAdjusted = new HashSet<>(adjusted.stream()
                .sorted(Comparator.comparing((LocalTime t) -> joins.get(t)).thenComparing(t -> t))
                .limit(MAX_ADJUSTED_TIMES)
                .toList());

        List<AvailabilityResponse.Slot> slots = new ArrayList<>();
        for (LocalTime start : starts) {
            if (rules.slotStarts().contains(start) || offeredAdjusted.contains(start)) {
                slots.add(new AvailabilityResponse.Slot(start, rules.slotEnd(start), available.contains(start),
                        joins.containsKey(start)));
            }
        }
        return new AvailabilityResponse(venue.getSlug(), date, bookable, slots);
    }
}
