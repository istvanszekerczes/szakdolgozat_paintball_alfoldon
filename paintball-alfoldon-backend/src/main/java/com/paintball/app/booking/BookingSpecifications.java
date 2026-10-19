package com.paintball.app.booking;

import java.time.LocalDate;

import org.springframework.data.jpa.domain.Specification;

/** Optional filters of the admin booking list; a null argument means "no filter". */
final class BookingSpecifications {

    private BookingSpecifications() {
    }

    static Specification<Booking> matching(String venueSlug, LocalDate from, LocalDate to, BookingStatus status) {
        return (root, query, cb) -> {
            var predicate = cb.conjunction();
            if (venueSlug != null && !venueSlug.isBlank()) {
                predicate = cb.and(predicate, cb.equal(root.get("venue").get("slug"), venueSlug));
            }
            if (from != null) {
                predicate = cb.and(predicate, cb.greaterThanOrEqualTo(root.get("playDate"), from));
            }
            if (to != null) {
                predicate = cb.and(predicate, cb.lessThanOrEqualTo(root.get("playDate"), to));
            }
            if (status != null) {
                predicate = cb.and(predicate, cb.equal(root.get("status"), status));
            }
            return predicate;
        };
    }
}
