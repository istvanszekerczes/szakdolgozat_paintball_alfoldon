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

    /** Single booking with venue, customer and assignment, for the admin views. */
    @EntityGraph(attributePaths = { "venue", "customer", "car", "employees" })
    Optional<Booking> findWithDetailsById(Long id);

    /** Admin list: loads venue, customer and assignment in the same query. */
    @Override
    @EntityGraph(attributePaths = { "venue", "customer", "car", "employees" })
    List<Booking> findAll(Specification<Booking> spec, Sort sort);

    /** Games of one day with what the schedule needs (venue times, car, staff). */
    @EntityGraph(attributePaths = { "venue", "customer", "car", "employees" })
    List<Booking> findByPlayDateAndStatusIn(LocalDate playDate, Collection<BookingStatus> statuses);
}
