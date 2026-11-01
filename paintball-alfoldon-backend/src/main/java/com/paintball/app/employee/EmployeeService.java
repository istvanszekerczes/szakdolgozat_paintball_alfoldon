package com.paintball.app.employee;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.paintball.app.common.BookingRuleException;
import com.paintball.app.common.NotFoundException;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeExclusionRepository exclusionRepository;

    public EmployeeService(EmployeeRepository employeeRepository, EmployeeExclusionRepository exclusionRepository) {
        this.employeeRepository = employeeRepository;
        this.exclusionRepository = exclusionRepository;
    }

    @Transactional(readOnly = true)
    public List<Employee> list() {
        return employeeRepository.findAllByOrderByActiveDescNameAsc();
    }

    @Transactional
    public Employee create(EmployeeRequest request) {
        Employee employee = new Employee();
        apply(employee, request);
        return employeeRepository.save(employee);
    }

    @Transactional
    public Employee update(Long id, EmployeeRequest request) {
        Employee employee = get(id);
        apply(employee, request);
        return employee;
    }

    @Transactional(readOnly = true)
    public List<EmployeeExclusion> exclusions(Long employeeId) {
        get(employeeId);
        return exclusionRepository.findByEmployeeIdOrderByDateFromDesc(employeeId);
    }

    @Transactional
    public EmployeeExclusion addExclusion(Long employeeId, ExclusionRequest request) {
        if (request.dateTo().isBefore(request.dateFrom())) {
            throw new BookingRuleException("A távollét vége nem lehet a kezdete előtt.");
        }
        EmployeeExclusion exclusion = new EmployeeExclusion();
        exclusion.setEmployee(get(employeeId));
        exclusion.setDateFrom(request.dateFrom());
        exclusion.setDateTo(request.dateTo());
        exclusion.setReason(blankToNull(request.reason()));
        return exclusionRepository.save(exclusion);
    }

    @Transactional
    public void deleteExclusion(Long employeeId, Long exclusionId) {
        EmployeeExclusion exclusion = exclusionRepository.findById(exclusionId)
                .filter(x -> x.getEmployee().getId().equals(employeeId))
                .orElseThrow(() -> new NotFoundException("Nincs ilyen távollét: " + exclusionId));
        exclusionRepository.delete(exclusion);
    }

    private Employee get(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Nincs ilyen alkalmazott: " + id));
    }

    private static void apply(Employee employee, EmployeeRequest request) {
        employee.setName(request.name().trim());
        employee.setPhone(blankToNull(request.phone()));
        employee.setEmploymentType(request.employmentType());
        employee.setActive(request.active() == null || request.active());
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
