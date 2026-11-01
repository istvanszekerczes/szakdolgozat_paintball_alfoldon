package com.paintball.app.schedule;

import static com.paintball.app.schedule.ScheduleTestData.game;
import static com.paintball.app.schedule.ScheduleTestData.venue;
import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalTime;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.paintball.app.booking.Booking;
import com.paintball.app.schedule.ScheduleRules.Segment;
import com.paintball.app.schedule.ScheduleRules.SegmentType;
import com.paintball.app.venue.Venue;

class ScheduleRulesTest {

    private final Venue szeged = venue(1, "Boszorkánysziget", 15);
    private final Venue csarnok = venue(2, "Katonai csarnok", 15);
    private final Venue szolnok = venue(3, "Tiszaliget", 135);

    @Test
    void singleGameHasTravelSetupGameTeardownAndHomeTrip() {
        List<Segment> segments = ScheduleRules.segments(List.of(game(1, szolnok, "10:00", "12:00")));

        assertThat(segments).extracting(Segment::type).containsExactly(SegmentType.TRAVEL_OUT, SegmentType.SETUP,
                SegmentType.GAME, SegmentType.TEARDOWN, SegmentType.TRAVEL_HOME);
        // 10:00 - 45 min setup - 135 min travel = 7:00
        assertThat(segments.get(0).start()).isEqualTo(LocalTime.of(7, 0));
        assertThat(segments.get(1).start()).isEqualTo(LocalTime.of(9, 15));
        // 12:00 + 30 min teardown + 135 min travel = 14:45
        assertThat(segments.get(4).end()).isEqualTo(LocalTime.of(14, 45));
    }

    @Test
    void twoVenuesInOneDayGoStraightFromOneToTheOther() {
        List<Segment> segments = ScheduleRules.segments(
                List.of(game(2, szolnok, "14:00", "16:00"), game(1, szeged, "08:00", "10:00")));

        assertThat(segments).extracting(Segment::type).containsExactly(SegmentType.TRAVEL_OUT, SegmentType.SETUP,
                SegmentType.GAME, SegmentType.TEARDOWN, SegmentType.TRAVEL_BETWEEN, SegmentType.SETUP,
                SegmentType.GAME, SegmentType.TEARDOWN, SegmentType.TRAVEL_HOME);
        Segment between = segments.get(4);
        // packed up at 10:30, then the longer of the two travel times (135 min)
        assertThat(between.start()).isEqualTo(LocalTime.of(10, 30));
        assertThat(between.end()).isEqualTo(LocalTime.of(12, 45));
        assertThat(between.bookingId()).isEqualTo(2L);
    }

    @Test
    void sameVenueBackToBackKeepsTheEquipmentSetUp() {
        List<Segment> segments = ScheduleRules.segments(
                List.of(game(1, szeged, "10:00", "12:00"), game(2, szeged, "12:00", "14:00")));

        assertThat(segments).extracting(Segment::type).containsExactly(SegmentType.TRAVEL_OUT, SegmentType.SETUP,
                SegmentType.GAME, SegmentType.GAME, SegmentType.TEARDOWN, SegmentType.TRAVEL_HOME);
    }

    @Test
    void overlappingGamesClash() {
        assertThat(ScheduleRules.clash(game(1, szeged, "10:00", "12:00"), game(2, csarnok, "10:00", "12:00")))
                .isTrue();
    }

    @Test
    void travelAndSetupWindowsCountAsBusy() {
        Booking morning = game(1, szeged, "08:00", "10:00");
        // 10:00 + 30 teardown + 135 travel + 45 setup = 13:30, so a 12:00 game is impossible...
        assertThat(ScheduleRules.clash(morning, game(2, szolnok, "12:00", "14:00"))).isTrue();
        // ...but 14:00 works.
        assertThat(ScheduleRules.clash(morning, game(3, szolnok, "14:00", "16:00"))).isFalse();
    }

    @Test
    void sameVenueBackToBackDoesNotClash() {
        assertThat(ScheduleRules.clash(game(1, szeged, "10:00", "12:00"), game(2, szeged, "12:00", "14:00")))
                .isFalse();
    }

    @Test
    void firstClashIgnoresTheBookingItselfAndPicksTheEarliest() {
        Booking candidate = game(1, szeged, "10:00", "12:00");
        Booking early = game(2, csarnok, "08:00", "10:00");
        Booking late = game(3, csarnok, "12:00", "14:00");

        assertThat(ScheduleRules.firstClash(candidate, List.of(late, candidate, early))).contains(early);
        assertThat(ScheduleRules.firstClash(candidate, List.of(candidate))).isEmpty();
    }
}
