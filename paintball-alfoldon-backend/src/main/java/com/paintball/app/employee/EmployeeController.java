package com.paintball.app.employee;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Staff management (Alkalmazottak). There is no DELETE: an employee is deactivated with PUT active=false. */
@RestController
@RequestMapping("/api/admin/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping
    public List<EmployeeResponse> list() {
        return employeeService.list().stream().map(EmployeeResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EmployeeResponse create(@Valid @RequestBody EmployeeRequest request) {
        return EmployeeResponse.from(employeeService.create(request));
    }

    @PutMapping("/{id}")
    public EmployeeResponse update(@PathVariable Long id, @Valid @RequestBody EmployeeRequest request) {
        return EmployeeResponse.from(employeeService.update(id, request));
    }

    @GetMapping("/{id}/exclusions")
    public List<ExclusionResponse> exclusions(@PathVariable Long id) {
        return employeeService.exclusions(id).stream().map(ExclusionResponse::from).toList();
    }

    @PostMapping("/{id}/exclusions")
    @ResponseStatus(HttpStatus.CREATED)
    public ExclusionResponse addExclusion(@PathVariable Long id, @Valid @RequestBody ExclusionRequest request) {
        return ExclusionResponse.from(employeeService.addExclusion(id, request));
    }

    @DeleteMapping("/{id}/exclusions/{exclusionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteExclusion(@PathVariable Long id, @PathVariable Long exclusionId) {
        employeeService.deleteExclusion(id, exclusionId);
    }

    public record EmployeeResponse(Long id, String name, String phone, EmploymentType employmentType,
            boolean active) {

        static EmployeeResponse from(Employee e) {
            return new EmployeeResponse(e.getId(), e.getName(), e.getPhone(), e.getEmploymentType(), e.isActive());
        }
    }

    public record ExclusionResponse(Long id, LocalDate dateFrom, LocalDate dateTo, String reason) {

        static ExclusionResponse from(EmployeeExclusion x) {
            return new ExclusionResponse(x.getId(), x.getDateFrom(), x.getDateTo(), x.getReason());
        }
    }
}
