package com.paintball.app.employee;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface EmployeeExclusionRepository extends JpaRepository<EmployeeExclusion, Long> {

    List<EmployeeExclusion> findByEmployeeIdOrderByDateFromDesc(Long employeeId);

    /** Exclusions of the given employees that cover {@code date}. */
    @EntityGraph(attributePaths = "employee")
    @Query("select x from EmployeeExclusion x where x.employee.id in :employeeIds"
            + " and x.dateFrom <= :date and x.dateTo >= :date")
    List<EmployeeExclusion> findCovering(Collection<Long> employeeIds, LocalDate date);

    /** Exclusions that are not over yet, for the alerts. */
    @EntityGraph(attributePaths = "employee")
    List<EmployeeExclusion> findByDateToGreaterThanEqual(LocalDate date);
}
