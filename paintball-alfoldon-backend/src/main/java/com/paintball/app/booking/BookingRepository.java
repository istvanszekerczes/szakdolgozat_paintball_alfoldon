package com.paintball.app.booking;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.paintball.app.venue.Venue;

public interface BookingRepository extends JpaRepository<Booking, Long>, JpaSpecificationExecutor<Booking> {

    boolean existsByVenueAndPlayDateAndStartTimeAndStatusIn(Venue venue, LocalDate playDate, LocalTime startTime,
            Collection<BookingStatus> statuses);

    List<Booking> findByVenueAndPlayDateAndStatusIn(Venue venue, LocalDate playDate,
            Collection<BookingStatus> statuses);

    /** Single booking with venue and customer, for the admin views. */
    @EntityGraph(attributePaths = { "venue", "customer" })
    Optional<Booking> findWithDetailsById(Long id);

    /** Admin list: loads venue and customer in the same query. */
    @Override
    @EntityGraph(attributePaths = { "venue", "customer" })
    List<Booking> findAll(Specification<Booking> spec, Sort sort);
}
