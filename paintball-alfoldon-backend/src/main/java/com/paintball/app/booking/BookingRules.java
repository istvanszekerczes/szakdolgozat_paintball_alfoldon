package com.paintball.app.booking;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.stereotype.Component;

import com.paintball.app.common.BookingRuleException;
import com.paintball.app.config.AppProperties;
import com.paintball.app.venue.Venue;

/** The booking rules in one place, shared by the availability view and the booking itself. */
@Component
public class BookingRules {

    private final AppProperties.Booking settings;
    private final Clock clock;

    public BookingRules(AppProperties properties, Clock clock) {
        this.settings = properties.booking();
        this.clock = clock;
    }

    public List<LocalTime> slotStarts() {
        return settings.slotStarts();
    }

    public LocalTime slotEnd(LocalTime start) {
        return start.plus(settings.slotLength());
    }

    public LocalDate earliestBookableDate() {
        return LocalDate.now(clock).plusDays(settings.minDaysInAdvance());
    }

    public LocalDate latestBookableDate() {
        return LocalDate.now(clock).plusDays(settings.maxDaysInAdvance());
    }

    public boolean isBookableDate(LocalDate date) {
        return !date.isBefore(earliestBookableDate()) && !date.isAfter(latestBookableDate());
    }

    public void checkDate(LocalDate date) {
        if (date.isBefore(earliestBookableDate())) {
            throw new BookingRuleException("Online legalább " + settings.minDaysInAdvance()
                    + " nappal előre lehet foglalni. Rövidebb határidőre kérjük, hívj minket telefonon.");
        }
        if (date.isAfter(latestBookableDate())) {
            throw new BookingRuleException("Erre a dátumra még nem lehet foglalni.");
        }
    }

    public void checkSlot(LocalTime start) {
        if (!settings.slotStarts().contains(start)) {
            throw new BookingRuleException("Érvénytelen kezdési időpont: " + start);
        }
    }

    public void checkHeadcount(Venue venue, int headcount) {
        if (headcount < venue.getMinHeadcount() || headcount > venue.getMaxHeadcount()) {
            throw new BookingRuleException("Ezen a pályán " + venue.getMinHeadcount() + " és "
                    + venue.getMaxHeadcount() + " fő között lehet foglalni.");
        }
    }
}
