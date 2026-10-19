package com.paintball.app.config;

import java.time.Duration;
import java.time.LocalTime;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Application-specific settings under the {@code app.*} prefix.
 * Defaults live in application.properties; deployments override them with environment variables.
 */
@ConfigurationProperties(prefix = "app")
public record AppProperties(Booking booking, Cors cors, Security security) {

    /**
     * Booking rules.
     *
     * @param minDaysInAdvance bookings must be made at least this many days before the game
     * @param maxDaysInAdvance how far ahead the calendar is open
     * @param slotStarts       start times of the fixed daily slots
     * @param slotLength       length of one slot
     * @param timeZone         time zone used to decide what "today" is
     */
    public record Booking(int minDaysInAdvance, int maxDaysInAdvance, List<LocalTime> slotStarts,
            Duration slotLength, String timeZone) {
    }

    /**
     * Allowed browser origins. The public site may only call public endpoints,
     * the admin dashboard may only call {@code /api/admin/**}.
     */
    public record Cors(List<String> publicOrigins, List<String> adminOrigins) {
    }

    /**
     * @param jwtSecret         HMAC secret for signing admin tokens, at least 32 bytes
     * @param tokenTtl          lifetime of an admin token
     * @param bootstrapUsername admin user created on first start when no admin exists (optional)
     * @param bootstrapPassword password of that admin user (optional)
     */
    public record Security(String jwtSecret, Duration tokenTtl, String bootstrapUsername, String bootstrapPassword) {
    }
}
