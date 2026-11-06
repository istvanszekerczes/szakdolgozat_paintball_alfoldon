package com.paintball.app.venue;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.paintball.app.common.BookingRuleException;
import com.paintball.app.common.NotFoundException;
import com.paintball.app.schedule.CrewCapacity;

/** Pályák on the dashboard: every venue (inactive ones too), their times and blocks. */
@RestController
@RequestMapping("/api/admin/venues")
public class AdminVenueController {

    private final VenueRepository venueRepository;
    private final VenueBlockRepository blockRepository;
    private final CrewCapacity crewCapacity;
    private final Clock clock;

    public AdminVenueController(VenueRepository venueRepository, VenueBlockRepository blockRepository,
            CrewCapacity crewCapacity, Clock clock) {
        this.crewCapacity = crewCapacity;
        this.venueRepository = venueRepository;
        this.blockRepository = blockRepository;
        this.clock = clock;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<AdminVenueResponse> list() {
        return venueRepository.findAll().stream()
                .sorted(Comparator.comparing(Venue::getCity).thenComparing(Venue::getName))
                .map(AdminVenueResponse::from)
                .toList();
    }

    @PutMapping("/{id}")
    @Transactional
    public AdminVenueResponse update(@PathVariable Long id, @Valid @RequestBody VenueUpdate request) {
        Venue venue = get(id);
        venue.setActive(request.active());
        venue.setTravelMinutes(request.travelMinutes());
        venue.setSetupMinutes(request.setupMinutes());
        venue.setTeardownMinutes(request.teardownMinutes());
        // Other travel or setup times can change which car fits which game.
        crewCapacity.assignCarsFromToday();
        return AdminVenueResponse.from(venue);
    }

    /** Blocks that are not over yet. */
    @GetMapping("/{id}/blocks")
    @Transactional(readOnly = true)
    public List<BlockResponse> blocks(@PathVariable Long id) {
        get(id);
        return blockRepository.findByVenueIdAndEndsAtAfterOrderByStartsAt(id, LocalDate.now(clock).atStartOfDay())
                .stream().map(BlockResponse::from).toList();
    }

    @PostMapping("/{id}/blocks")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public BlockResponse addBlock(@PathVariable Long id, @Valid @RequestBody BlockRequest request) {
        if (!request.startsAt().isBefore(request.endsAt())) {
            throw new BookingRuleException("A zárolás vége a kezdete után legyen.");
        }
        VenueBlock block = new VenueBlock();
        block.setVenue(get(id));
        block.setStartsAt(request.startsAt());
        block.setEndsAt(request.endsAt());
        block.setReason(request.reason() == null || request.reason().isBlank() ? null : request.reason().trim());
        return BlockResponse.from(blockRepository.save(block));
    }

    @DeleteMapping("/{id}/blocks/{blockId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void deleteBlock(@PathVariable Long id, @PathVariable Long blockId) {
        VenueBlock block = blockRepository.findById(blockId)
                .filter(b -> b.getVenue().getId().equals(id))
                .orElseThrow(() -> new NotFoundException("Nincs ilyen zárolás: " + blockId));
        blockRepository.delete(block);
    }

    private Venue get(Long id) {
        return venueRepository.findById(id).orElseThrow(() -> new NotFoundException("Nincs ilyen pálya: " + id));
    }

    public record AdminVenueResponse(Long id, String slug, String city, String name, boolean indoor, String address,
            int minHeadcount, int maxHeadcount, boolean active, int travelMinutes, int setupMinutes,
            int teardownMinutes) {

        static AdminVenueResponse from(Venue v) {
            return new AdminVenueResponse(v.getId(), v.getSlug(), v.getCity(), v.getName(), v.isIndoor(),
                    v.getAddress(), v.getMinHeadcount(), v.getMaxHeadcount(), v.isActive(), v.getTravelMinutes(),
                    v.getSetupMinutes(), v.getTeardownMinutes());
        }
    }

    public record VenueUpdate(
            @NotNull Boolean active,
            @NotNull @Min(value = 0, message = "Nem lehet negatív.") @Max(value = 600, message = "Legfeljebb 600 perc.") Integer travelMinutes,
            @NotNull @Min(value = 0, message = "Nem lehet negatív.") @Max(value = 240, message = "Legfeljebb 240 perc.") Integer setupMinutes,
            @NotNull @Min(value = 0, message = "Nem lehet negatív.") @Max(value = 240, message = "Legfeljebb 240 perc.") Integer teardownMinutes) {
    }

    public record BlockRequest(
            @NotNull(message = "Add meg a kezdetét.") LocalDateTime startsAt,
            @NotNull(message = "Add meg a végét.") LocalDateTime endsAt,
            @Size(max = 300, message = "Az indoklás legfeljebb 300 karakter.") String reason) {
    }

    public record BlockResponse(Long id, LocalDateTime startsAt, LocalDateTime endsAt, String reason) {

        static BlockResponse from(VenueBlock b) {
            return new BlockResponse(b.getId(), b.getStartsAt(), b.getEndsAt(), b.getReason());
        }
    }
}
