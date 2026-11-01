package com.paintball.app.employee;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** New or edited employee. {@code active} defaults to true; deactivating replaces deleting. */
public record EmployeeRequest(
        @NotBlank(message = "Add meg a nevet.") @Size(max = 200) String name,
        @Pattern(regexp = "^$|^[+0-9 ()/-]{6,30}$", message = "Érvénytelen telefonszám.") String phone,
        @NotNull(message = "Válaszd ki a foglalkoztatás típusát.") EmploymentType employmentType,
        Boolean active) {
}
