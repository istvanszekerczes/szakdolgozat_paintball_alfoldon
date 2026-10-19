package com.paintball.app.venue;

import java.util.List;
import java.util.Optional;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

public interface VenueRepository extends JpaRepository<Venue, Long> {

    Optional<Venue> findBySlug(String slug);

    List<Venue> findAllByActiveTrueOrderByCityAscNameAsc();

    /**
     * Loads the venue with a row lock so two customers cannot book the same slot at the same time:
     * the second booking waits until the first transaction commits, then sees the slot as taken.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from Venue v where v.slug = :slug")
    Optional<Venue> findBySlugForUpdate(String slug);
}
