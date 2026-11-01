package com.paintball.app.alert;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.paintball.app.booking.BookingService;
import com.paintball.app.employee.EmployeeExclusionRepository;
import com.paintball.app.venue.VenueBlockRepository;

/** "Figyelmet igényel" on the overview; the rules themselves are in AlertRules. */
@RestController
@RequestMapping("/api/admin/alerts")
public class AlertController {

    private final BookingService bookingService;
    private final EmployeeExclusionRepository exclusionRepository;
    private final VenueBlockRepository venueBlockRepository;
    private final Clock clock;

    public AlertController(BookingService bookingService, EmployeeExclusionRepository exclusionRepository,
            VenueBlockRepository venueBlockRepository, Clock clock) {
        this.bookingService = bookingService;
        this.exclusionRepository = exclusionRepository;
        this.venueBlockRepository = venueBlockRepository;
        this.clock = clock;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<AlertRules.Alert> list() {
        LocalDate today = LocalDate.now(clock);
        return AlertRules.compute(bookingService.search(null, today, null, null),
                exclusionRepository.findByDateToGreaterThanEqual(today),
                venueBlockRepository.findByEndsAtAfter(today.atStartOfDay()), Instant.now(clock), today);
    }
}
