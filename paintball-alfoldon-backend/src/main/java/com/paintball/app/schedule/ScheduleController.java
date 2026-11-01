package com.paintball.app.schedule;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.paintball.app.booking.AdminBookingResponse;

/** Beosztás: assigning cars and staff, and the computed plan of a day. */
@RestController
public class ScheduleController {

    private final AssignmentService assignmentService;
    private final ScheduleService scheduleService;

    public ScheduleController(AssignmentService assignmentService, ScheduleService scheduleService) {
        this.assignmentService = assignmentService;
        this.scheduleService = scheduleService;
    }

    @PutMapping("/api/admin/bookings/{id}/assignment")
    public AdminBookingResponse assign(@PathVariable Long id, @RequestBody AssignmentRequest request) {
        return AdminBookingResponse.from(assignmentService.assign(id, request.carId(), request.employeeIds()));
    }

    @GetMapping("/api/admin/schedule")
    public ScheduleService.DaySchedule schedule(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return scheduleService.forDay(date);
    }

    /** {@code carId} null and an empty list clear the assignment. */
    public record AssignmentRequest(Long carId, List<Long> employeeIds) {
    }
}
