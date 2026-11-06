package com.paintball.app.schedule;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import com.paintball.app.booking.Booking;
import com.paintball.app.car.Car;

/**
 * Splits the games of one day between the cars (one car = one crew), so that no car has two games
 * it cannot do one after the other ({@link ScheduleRules#clash}). The site only offers a time when
 * such a split still exists, which is what makes overbooking impossible, and the cars of the games
 * are set from the split automatically.
 * <p>
 * Among the possible splits the planner picks the one with the shortest working days in total (from
 * leaving the base until getting back), so the crews' days are packed instead of spread out. When two
 * splits are equally good, the one that moves fewer games to another car wins, so a new booking does
 * not shuffle the cars of the earlier ones for nothing. A day has only a handful of games, so trying
 * every split (cutting branches that are already worse than the best one) is fast enough.
 */
public final class CrewPlanner {

    private static final Comparator<Booking> BY_START = Comparator.comparing(Booking::getStartTime);

    private CrewPlanner() {
    }

    /** One car's games in the plan. */
    public record CarPlan(Car car, List<Booking> games) {
    }

    /** The cars of the plan in the order given, and the total length of their working days in minutes. */
    public record Plan(List<CarPlan> cars, int workMinutes) {

        public Optional<Car> carOf(Booking game) {
            return cars.stream()
                    .filter(c -> c.games().contains(game))
                    .map(CarPlan::car)
                    .findFirst();
        }
    }

    /** The best split of {@code games} (same day) between {@code cars}, or empty when they cannot do all. */
    public static Optional<Plan> plan(Collection<Booking> games, Collection<Car> cars) {
        List<Car> crews = List.copyOf(cars);
        Search search = new Search(games.stream().sorted(BY_START).toList(), crews);
        search.run(0, 0);
        if (search.best == null) {
            return Optional.empty();
        }
        List<CarPlan> out = new ArrayList<>();
        for (int c = 0; c < crews.size(); c++) {
            out.add(new CarPlan(crews.get(c), search.best.get(c)));
        }
        return Optional.of(new Plan(out, search.bestWork));
    }

    public static boolean fits(Collection<Booking> games, Collection<Car> cars) {
        return plan(games, cars).isPresent();
    }

    /** Minutes from leaving the base until getting back for one car doing these games. */
    static int workMinutes(List<Booking> games) {
        if (games.isEmpty()) {
            return 0;
        }
        List<ScheduleRules.Segment> segments = ScheduleRules.segments(games);
        return minutes(segments.get(segments.size() - 1).end()) - minutes(segments.get(0).start());
    }

    static boolean sameCar(Car a, Car b) {
        return a == b || (a != null && b != null && a.getId() != null && Objects.equals(a.getId(), b.getId()));
    }

    private static int minutes(LocalTime time) {
        return time.getHour() * 60 + time.getMinute();
    }

    /** Depth-first search over the games in start order, keeping the cheapest complete split. */
    private static final class Search {

        private final List<Booking> games;
        private final List<Car> crews;
        private final List<List<Booking>> current = new ArrayList<>();
        private List<List<Booking>> best;
        private int bestWork = Integer.MAX_VALUE;
        private int bestMoved = Integer.MAX_VALUE;

        Search(List<Booking> games, List<Car> crews) {
            this.games = games;
            this.crews = crews;
            for (int c = 0; c < crews.size(); c++) {
                current.add(new ArrayList<>());
            }
        }

        /** {@code moved}: games so far that are put on another car than the one they have now. */
        void run(int index, int moved) {
            // Adding a later game never shortens a crew's day, so the work so far is a lower bound.
            int work = work();
            if (work > bestWork || (work == bestWork && moved >= bestMoved)) {
                return;
            }
            if (index == games.size()) {
                bestWork = work;
                bestMoved = moved;
                best = current.stream().map(c -> (List<Booking>) List.copyOf(c)).toList();
                return;
            }
            Booking game = games.get(index);
            boolean triedEmptyCrew = false;
            for (int c = 0; c < crews.size(); c++) {
                List<Booking> crewGames = current.get(c);
                boolean own = game.getCar() != null && sameCar(game.getCar(), crews.get(c));
                boolean moves = game.getCar() != null && !own;
                // Cars without games yet are alike, so one of them is enough (but always try the game's own).
                if (crewGames.isEmpty() && !own) {
                    if (triedEmptyCrew) {
                        continue;
                    }
                    triedEmptyCrew = true;
                }
                if (ScheduleRules.firstClash(game, crewGames).isPresent()) {
                    continue;
                }
                crewGames.add(game);
                run(index + 1, moved + (moves ? 1 : 0));
                crewGames.remove(crewGames.size() - 1);
            }
        }

        private int work() {
            int total = 0;
            for (List<Booking> crewGames : current) {
                total += workMinutes(crewGames);
            }
            return total;
        }
    }
}
