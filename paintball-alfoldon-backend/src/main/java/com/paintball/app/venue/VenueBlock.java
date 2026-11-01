package com.paintball.app.venue;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** A period when a venue cannot be booked (pályazárolás). Times are local (Europe/Budapest). */
@Entity
@Table(name = "venue_block")
@Getter
@Setter
@NoArgsConstructor
public class VenueBlock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "venue_id")
    private Venue venue;

    @Column(name = "starts_at", nullable = false)
    private LocalDateTime startsAt;

    @Column(name = "ends_at", nullable = false)
    private LocalDateTime endsAt;

    private String reason;

    /** True when the block and the [start, end) time range of that day overlap. */
    public boolean overlaps(LocalDate date, LocalTime start, LocalTime end) {
        return startsAt.isBefore(date.atTime(end)) && endsAt.isAfter(date.atTime(start));
    }
}
