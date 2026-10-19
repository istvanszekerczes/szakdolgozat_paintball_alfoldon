package com.paintball.app.booking;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Booking management for the admin dashboard. Requires an admin token (see SecurityConfig). */
@RestController
@RequestMapping("/api/admin/bookings")
public class AdminBookingController {

    private final BookingService bookingService;

    public AdminBookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping
    public List<AdminBookingResponse> list(@RequestParam(required = false) String venue,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) BookingStatus status) {
        return bookingService.search(venue, from, to, status).stream().map(AdminBookingResponse::from).toList();
    }

    @GetMapping("/{id}")
    public AdminBookingResponse get(@PathVariable Long id) {
        return AdminBookingResponse.from(bookingService.get(id));
    }

    @PatchMapping("/{id}/status")
    public AdminBookingResponse changeStatus(@PathVariable Long id, @Valid @RequestBody StatusChange request) {
        return AdminBookingResponse.from(bookingService.changeStatus(id, request.status()));
    }

    public record StatusChange(@NotNull BookingStatus status) {
    }
}
