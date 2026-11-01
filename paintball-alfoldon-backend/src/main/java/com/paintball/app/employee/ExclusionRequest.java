package com.paintball.app.employee;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ExclusionRequest(
        @NotNull(message = "Add meg a kezdőnapot.") LocalDate dateFrom,
        @NotNull(message = "Add meg az utolsó napot.") LocalDate dateTo,
        @Size(max = 300, message = "Az indoklás legfeljebb 300 karakter.") String reason) {
}
