package com.paintball.app.schedule;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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
    private final ProposalService proposalService;

    public ScheduleController(AssignmentService assignmentService, ScheduleService scheduleService,
            ProposalService proposalService) {
        this.assignmentService = assignmentService;
        this.scheduleService = scheduleService;
        this.proposalService = proposalService;
    }

    @PutMapping("/api/admin/bookings/{id}/assignment")
    public AdminBookingResponse assign(@PathVariable Long id, @RequestBody AssignmentRequest request) {
        return AdminBookingResponse.from(assignmentService.assign(id, request.employeeIds()));
    }

    @GetMapping("/api/admin/schedule")
    public ScheduleService.DaySchedule schedule(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return scheduleService.forDay(date);
    }

    /** The proposed staff of a day; nothing is saved. */
    @GetMapping("/api/admin/schedule/proposal")
    public ProposalService.Proposal proposal(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return proposalService.propose(date);
    }

    /** Saves the assignments of a proposal the admin accepted, all or nothing. */
    @PostMapping("/api/admin/schedule/proposal/apply")
    public ResponseEntity<Void> apply(@RequestBody List<ProposalService.ApplyItem> items) {
        proposalService.apply(items);
        return ResponseEntity.noContent().build();
    }

    /** The staff of a game; an empty list clears it. The car is assigned automatically. */
    public record AssignmentRequest(List<Long> employeeIds) {
    }
}
