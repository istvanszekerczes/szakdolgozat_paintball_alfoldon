package com.paintball.app.venue;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.paintball.app.booking.AvailabilityResponse;
import com.paintball.app.booking.AvailabilityService;
import com.paintball.app.common.NotFoundException;

/** Public, read-only venue data for the field pages, the map and the booking wizard. */
@RestController
@RequestMapping("/api/venues")
public class VenueController {

    private final VenueRepository venueRepository;
    private final AvailabilityService availabilityService;

    public VenueController(VenueRepository venueRepository, AvailabilityService availabilityService) {
        this.venueRepository = venueRepository;
        this.availabilityService = availabilityService;
    }

    @GetMapping
    public List<VenueResponse> list() {
        return venueRepository.findAllByActiveTrueOrderByCityAscNameAsc().stream().map(VenueResponse::from).toList();
    }

    @GetMapping("/{slug}")
    public VenueResponse get(@PathVariable String slug) {
        return venueRepository.findBySlug(slug)
                .filter(Venue::isActive)
                .map(VenueResponse::from)
                .orElseThrow(() -> new NotFoundException("Nincs ilyen pálya: " + slug));
    }

    @GetMapping("/{slug}/availability")
    public AvailabilityResponse availability(@PathVariable String slug,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return availabilityService.forDay(slug, date);
    }
}
