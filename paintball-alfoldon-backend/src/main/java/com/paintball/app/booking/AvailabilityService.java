package com.paintball.app.booking;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.paintball.app.common.NotFoundException;
import com.paintball.app.venue.Venue;
import com.paintball.app.venue.VenueRepository;

@Service
public class AvailabilityService {

    private final VenueRepository venueRepository;
    private final BookingRepository bookingRepository;
    private final BookingRules rules;

    public AvailabilityService(VenueRepository venueRepository, BookingRepository bookingRepository,
            BookingRules rules) {
        this.venueRepository = venueRepository;
        this.bookingRepository = bookingRepository;
        this.rules = rules;
    }

    @Transactional(readOnly = true)
    public AvailabilityResponse forDay(String venueSlug, LocalDate date) {
        Venue venue = venueRepository.findBySlug(venueSlug)
                .filter(Venue::isActive)
                .orElseThrow(() -> new NotFoundException("Nincs ilyen pálya: " + venueSlug));
        boolean bookable = rules.isBookableDate(date);
        Set<LocalTime> taken = bookingRepository
                .findByVenueAndPlayDateAndStatusIn(venue, date, BookingStatus.OCCUPYING).stream()
                .map(Booking::getStartTime)
                .collect(Collectors.toSet());
        List<AvailabilityResponse.Slot> slots = rules.slotStarts().stream()
                .map(start -> new AvailabilityResponse.Slot(start, rules.slotEnd(start),
                        bookable && !taken.contains(start)))
                .toList();
        return new AvailabilityResponse(venue.getSlug(), date, bookable, slots);
    }
}
