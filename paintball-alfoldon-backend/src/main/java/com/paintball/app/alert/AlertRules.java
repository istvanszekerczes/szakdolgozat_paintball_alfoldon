package com.paintball.app.alert;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

import com.paintball.app.booking.Booking;
import com.paintball.app.booking.BookingStatus;
import com.paintball.app.employee.Employee;
import com.paintball.app.employee.EmployeeExclusion;
import com.paintball.app.venue.VenueBlock;

/** Computes the "Figyelmet igényel" list. Nothing is stored: the alerts disappear once the cause is fixed. */
public final class AlertRules {

    /** A pending booking older than this is "régóta függő". */
    static final Duration LONG_PENDING = Duration.ofHours(48);
    /** Accepted games this many days ahead must have a car and staff. */
    static final int ASSIGN_WITHIN_DAYS = 7;

    private static final DateTimeFormatter DAY = DateTimeFormatter.ofPattern("MMM d.", Locale.forLanguageTag("hu"));
    private static final DateTimeFormatter HM = DateTimeFormatter.ofPattern("H:mm");

    private AlertRules() {
    }

    public enum Type { PENDING_SOON, LONG_PENDING, UNASSIGNED, EMPLOYEE_AWAY, VENUE_BLOCKED }

    public enum Severity { DANGER, WARN }

    public record Alert(Type type, Severity severity, String title, String detail, Long bookingId, LocalDate date) {
    }

    /**
     * @param bookings   bookings from today on (any status; only pending and accepted ones count)
     * @param exclusions employee exclusions that are not over yet
     * @param blocks     venue blocks that are not over yet
     */
    public static List<Alert> compute(Collection<Booking> bookings, Collection<EmployeeExclusion> exclusions,
            Collection<VenueBlock> blocks, Instant now, LocalDate today) {
        List<Alert> out = new ArrayList<>();
        LocalDate assignLimit = today.plusDays(ASSIGN_WITHIN_DAYS);
        for (Booking b : bookings) {
            if (b.getPlayDate().isBefore(today) || !BookingStatus.OCCUPYING.contains(b.getStatus())) {
                continue;
            }
            String when = DAY.format(b.getPlayDate()) + " " + HM.format(b.getStartTime()) + " · "
                    + b.getVenue().getName();

            if (b.getStatus() == BookingStatus.PENDING) {
                if (b.getPlayDate().isBefore(assignLimit)) {
                    out.add(new Alert(Type.PENDING_SOON, Severity.DANGER, "Közeli, még függő foglalás",
                            b.getCustomer().getName() + ", " + when + ". A játékig kevesebb mint egy hét van.",
                            b.getId(), b.getPlayDate()));
                } else if (b.getCreatedAt().plus(LONG_PENDING).isBefore(now)) {
                    long hours = Duration.between(b.getCreatedAt(), now).toHours();
                    out.add(new Alert(Type.LONG_PENDING, Severity.WARN, "Régóta függő foglalás",
                            b.getCustomer().getName() + ", " + when + ". " + hours / 24 + " napja vár döntésre.",
                            b.getId(), b.getPlayDate()));
                }
            }

            if (b.getStatus() == BookingStatus.ACCEPTED && b.getPlayDate().isBefore(assignLimit)) {
                boolean noCar = b.getCar() == null;
                boolean noStaff = b.getEmployees().isEmpty();
                if (noCar || noStaff) {
                    String missing = noCar && noStaff ? "autó és dolgozó" : noCar ? "autó" : "dolgozó";
                    boolean soon = b.getPlayDate().isBefore(today.plusDays(2));
                    out.add(new Alert(Type.UNASSIGNED, soon ? Severity.DANGER : Severity.WARN,
                            "Hiányos beosztás", when + ": nincs " + missing + " beosztva.", b.getId(),
                            b.getPlayDate()));
                }
            }

            for (Employee e : b.getEmployees()) {
                exclusions.stream()
                        .filter(x -> x.getEmployee().getId().equals(e.getId()) && x.covers(b.getPlayDate()))
                        .findFirst()
                        .ifPresent(x -> out.add(new Alert(Type.EMPLOYEE_AWAY, Severity.DANGER,
                                "Távollévő dolgozó beosztva",
                                e.getName() + " nem elérhető" + (x.getReason() == null ? "" : " (" + x.getReason() + ")")
                                        + ", mégis be van osztva: " + when + ".",
                                b.getId(), b.getPlayDate())));
            }

            blocks.stream()
                    .filter(block -> block.getVenue().getId().equals(b.getVenue().getId())
                            && block.overlaps(b.getPlayDate(), b.getStartTime(), b.getEndTime()))
                    .findFirst()
                    .ifPresent(block -> out.add(new Alert(Type.VENUE_BLOCKED, Severity.DANGER,
                            "Zárolt pályára szóló foglalás",
                            when + (block.getReason() == null ? "" : " · zárolás oka: " + block.getReason()) + ".",
                            b.getId(), b.getPlayDate())));
        }
        out.sort(Comparator.comparing(Alert::severity).thenComparing(Alert::date));
        return out;
    }
}
