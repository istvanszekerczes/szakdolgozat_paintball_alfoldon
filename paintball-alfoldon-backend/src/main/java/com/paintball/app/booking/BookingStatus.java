package com.paintball.app.booking;

import java.util.EnumSet;
import java.util.Set;

public enum BookingStatus {
    /** Sent by the customer, waiting for an admin (függő). */
    PENDING,
    /** Confirmed by an admin (elfogadva). */
    ACCEPTED,
    /** Declined by an admin (elutasítva). */
    REJECTED,
    /** Cancelled after it had been accepted (lemondva). */
    CANCELLED;

    /** Statuses that keep a slot occupied. */
    public static final Set<BookingStatus> OCCUPYING = EnumSet.of(PENDING, ACCEPTED);

    public boolean canChangeTo(BookingStatus next) {
        return switch (this) {
            case PENDING -> next == ACCEPTED || next == REJECTED;
            case ACCEPTED -> next == CANCELLED;
            case REJECTED, CANCELLED -> false;
        };
    }
}
