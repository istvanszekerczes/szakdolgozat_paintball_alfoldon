package com.paintball.app.schedule;

import static com.paintball.app.schedule.ScheduleTestData.car;
import static com.paintball.app.schedule.ScheduleTestData.game;
import static com.paintball.app.schedule.ScheduleTestData.venue;
import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;

import com.paintball.app.booking.Booking;
import com.paintball.app.car.Car;
import com.paintball.app.venue.Venue;

class CrewPlannerTest {

    private final Venue szeged = venue(1, "Boszorkánysziget", 15);
    private final Venue csarnok = venue(2, "Katonai csarnok", 15);
    private final Venue szentes = venue(3, "Szentes", 65);
    private final Venue szolnok = venue(4, "Tiszaliget", 135);
    private final Venue kecskemet = venue(5, "Kecskemét", 105);
    private final Car a = car(1, "AAA-111", 5);
    private final Car b = car(2, "BBB-222", 5);

    @Test
    void twoCarsTakeAtMostTwoGamesAtTheSameTime() {
        List<Booking> two = List.of(game(1, szeged, "10:00", "12:00"), game(2, szolnok, "10:00", "12:00"));
        List<Booking> three = List.of(game(1, szeged, "10:00", "12:00"), game(2, szolnok, "10:00", "12:00"),
                game(3, csarnok, "10:00", "12:00"));

        assertThat(CrewPlanner.fits(two, List.of(a, b))).isTrue();
        assertThat(CrewPlanner.fits(three, List.of(a, b))).isFalse();
        assertThat(CrewPlanner.fits(two, List.of())).isFalse();
    }

    @Test
    void oneCarCanDriveOnWhenThereIsTimeToPackUpAndTravel() {
        // Szeged ends 12:00, then 30 min packing, 65 min driving, 45 min setup: Szentes from 14:20.
        assertThat(CrewPlanner.fits(List.of(game(1, szeged, "10:00", "12:00"), game(2, szentes, "14:00", "16:00")),
                List.of(a))).isFalse();
        assertThat(CrewPlanner.fits(List.of(game(1, szeged, "10:00", "12:00"), game(2, szentes, "16:00", "18:00")),
                List.of(a))).isTrue();
    }

    @Test
    void drivesStraightFromOneVenueToTheNextNotThroughSzeged() {
        // Szentes → Kecskemét is about 70 min; through Szeged it would be 65 + 105.
        assertThat(ScheduleRules.transfer(szentes, kecskemet)).isEqualTo(70);
        // Szentes ends 12:00, 30 min packing, 70 min driving, 45 min setup: Kecskemét from 14:25.
        assertThat(CrewPlanner.fits(List.of(game(1, szentes, "10:00", "12:00"), game(2, kecskemet, "14:00", "16:00")),
                List.of(a))).isFalse();
        assertThat(CrewPlanner.fits(List.of(game(1, szentes, "10:00", "12:00"), game(2, kecskemet, "14:30", "16:30")),
                List.of(a))).isTrue();
    }

    @Test
    void keepsTheCarAGameAlreadyHasWhenThatIsAsGood() {
        Booking fixed = game(1, szeged, "08:00", "10:00");
        fixed.setCar(b);
        Booking other = game(2, szeged, "10:00", "12:00");

        CrewPlanner.Plan plan = CrewPlanner.plan(List.of(fixed, other), List.of(a, b)).orElseThrow();

        assertThat(plan.carOf(fixed)).contains(b);
        // Same venue back to back: the cheapest plan puts the second game on the same car.
        assertThat(plan.carOf(other)).contains(b);
    }

    @Test
    void picksThePlanWithTheShortestWorkingDays() {
        Booking morningSzeged = game(1, szeged, "08:00", "10:00");
        Booking noonSzeged = game(2, szeged, "10:00", "12:00");
        Booking szolnokGame = game(3, szolnok, "10:00", "12:00");

        CrewPlanner.Plan plan = CrewPlanner.plan(List.of(morningSzeged, noonSzeged, szolnokGame), List.of(a, b))
                .orElseThrow();

        assertThat(plan.carOf(morningSzeged)).isEqualTo(plan.carOf(noonSzeged));
        assertThat(plan.carOf(szolnokGame)).isNotEqualTo(plan.carOf(noonSzeged));
    }

    @Test
    void movesGamesToAnotherCarWhenTheirCarsClash() {
        Booking first = game(1, szeged, "10:00", "12:00");
        first.setCar(a);
        Booking second = game(2, szolnok, "10:00", "12:00");
        second.setCar(a);

        CrewPlanner.Plan plan = CrewPlanner.plan(List.of(first, second), List.of(a, b)).orElseThrow();

        assertThat(plan.carOf(first)).contains(a);
        assertThat(plan.carOf(second)).contains(b);
    }
}
