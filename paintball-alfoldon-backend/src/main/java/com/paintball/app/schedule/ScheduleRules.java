package com.paintball.app.schedule;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import com.paintball.app.booking.Booking;
import com.paintball.app.venue.Venue;

/**
 * Time rules of the daily schedule. A car (and the staff in it) works a game like this:
 * odaút → kipakolás → játék → elpakolás → hazaút. When it has several games that day it goes
 * straight from one venue to the next (köztes út) instead of driving home in between; at the same
 * venue the equipment simply stays set up.
 * <p>
 * The road time between two venues is estimated as the longer of their travel times from the base:
 * never shorter than reality for venues on opposite sides of the base, and simple to explain.
 * Times are minutes of the day so that early starts never wrap around midnight.
 */
public final class ScheduleRules {

    private static final Comparator<Booking> BY_START = Comparator.comparing(Booking::getStartTime);

    private ScheduleRules() {
    }

    public enum SegmentType {
        /** Odaút: from the base to the first venue. */
        TRAVEL_OUT,
        /** Kipakolás. */
        SETUP,
        /** Játék. */
        GAME,
        /** Elpakolás. */
        TEARDOWN,
        /** Köztes út: straight from one venue to the next. */
        TRAVEL_BETWEEN,
        /** Hazaút: back to the base. */
        TRAVEL_HOME
    }

    public record Segment(SegmentType type, LocalTime start, LocalTime end, Long bookingId, String venueName) {
    }

    /** Minutes needed between the end of {@code first} and the start of {@code next} when one crew does both. */
    static int requiredGap(Booking first, Booking next) {
        if (sameVenue(first, next)) {
            return 0;
        }
        return first.getVenue().getTeardownMinutes() + transfer(first.getVenue(), next.getVenue())
                + next.getVenue().getSetupMinutes();
    }

    /** True when one car or crew cannot do both games of the same day. */
    public static boolean clash(Booking a, Booking b) {
        Booking first = BY_START.compare(a, b) <= 0 ? a : b;
        Booking next = first == a ? b : a;
        return minutes(next.getStartTime()) - minutes(first.getEndTime()) < requiredGap(first, next);
    }

    /** The first of {@code others} (same day) that cannot be done together with {@code candidate}. */
    public static Optional<Booking> firstClash(Booking candidate, Collection<Booking> others) {
        return others.stream()
                .filter(other -> other != candidate
                        && (other.getId() == null || !other.getId().equals(candidate.getId())))
                .filter(other -> clash(candidate, other))
                .min(BY_START);
    }

    /** The working day of one car or crew doing these games (all on the same day). */
    public static List<Segment> segments(Collection<Booking> games) {
        List<Booking> sorted = games.stream().sorted(BY_START).toList();
        List<Segment> out = new ArrayList<>();
        for (int i = 0; i < sorted.size(); i++) {
            Booking game = sorted.get(i);
            Venue venue = game.getVenue();
            int start = minutes(game.getStartTime());
            int end = minutes(game.getEndTime());
            if (i == 0) {
                add(out, SegmentType.TRAVEL_OUT, start - venue.getSetupMinutes() - venue.getTravelMinutes(),
                        start - venue.getSetupMinutes(), game);
                add(out, SegmentType.SETUP, start - venue.getSetupMinutes(), start, game);
            } else {
                Booking previous = sorted.get(i - 1);
                if (!sameVenue(previous, game)) {
                    int packedUp = minutes(previous.getEndTime()) + previous.getVenue().getTeardownMinutes();
                    add(out, SegmentType.TEARDOWN, minutes(previous.getEndTime()), packedUp, previous);
                    add(out, SegmentType.TRAVEL_BETWEEN, packedUp,
                            packedUp + transfer(previous.getVenue(), venue), game);
                    add(out, SegmentType.SETUP, start - venue.getSetupMinutes(), start, game);
                }
            }
            add(out, SegmentType.GAME, start, end, game);
            if (i == sorted.size() - 1) {
                add(out, SegmentType.TEARDOWN, end, end + venue.getTeardownMinutes(), game);
                add(out, SegmentType.TRAVEL_HOME, end + venue.getTeardownMinutes(),
                        end + venue.getTeardownMinutes() + venue.getTravelMinutes(), game);
            }
        }
        return out;
    }

    static int transfer(Venue from, Venue to) {
        return Math.max(from.getTravelMinutes(), to.getTravelMinutes());
    }

    private static boolean sameVenue(Booking a, Booking b) {
        return a.getVenue() == b.getVenue()
                || (a.getVenue().getId() != null && a.getVenue().getId().equals(b.getVenue().getId()));
    }

    private static void add(List<Segment> out, SegmentType type, int start, int end, Booking game) {
        if (end > start) {
            out.add(new Segment(type, time(start), time(end), game.getId(), game.getVenue().getName()));
        }
    }

    private static int minutes(LocalTime time) {
        return time.getHour() * 60 + time.getMinute();
    }

    /** Minutes of the day back to a time; a day plan never leaves the day, but clamp to be safe. */
    private static LocalTime time(int minutes) {
        int clamped = Math.max(0, Math.min(minutes, 24 * 60 - 1));
        return LocalTime.of(clamped / 60, clamped % 60);
    }
}
