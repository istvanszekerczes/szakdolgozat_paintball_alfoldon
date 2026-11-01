package com.paintball.app.venue;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface VenueBlockRepository extends JpaRepository<VenueBlock, Long> {

    /** Blocks of a venue that overlap [from, to). */
    @Query("select b from VenueBlock b where b.venue = :venue and b.startsAt < :to and b.endsAt > :from")
    List<VenueBlock> findOverlapping(Venue venue, LocalDateTime from, LocalDateTime to);

    List<VenueBlock> findByVenueIdAndEndsAtAfterOrderByStartsAt(Long venueId, LocalDateTime after);

    /** Blocks that are not over yet, for the alerts. */
    @EntityGraph(attributePaths = "venue")
    List<VenueBlock> findByEndsAtAfter(LocalDateTime after);
}
