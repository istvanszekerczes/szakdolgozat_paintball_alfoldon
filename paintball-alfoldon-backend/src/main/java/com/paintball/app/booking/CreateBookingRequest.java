package com.paintball.app.booking;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/** What the booking wizard sends. Business rules (dates, slots, headcount per venue) are checked in the service. */
public record CreateBookingRequest(
        @NotBlank(message = "Válassz pályát.") String venueSlug,
        @NotNull(message = "Válassz dátumot.") LocalDate date,
        @NotNull(message = "Válassz időpontot.") LocalTime startTime,
        @NotNull(message = "Add meg a létszámot.") @Positive(message = "A létszám legalább 1 fő.") Integer headcount,
        @NotBlank(message = "Add meg a neved.") @Size(max = 200) String name,
        @NotBlank(message = "Add meg az e-mail címed.") @Email(message = "Érvénytelen e-mail cím.") @Size(max = 200) String email,
        @NotBlank(message = "Add meg a telefonszámod.") @Pattern(regexp = "^[+0-9 ()/-]{6,30}$", message = "Érvénytelen telefonszám.") String phone,
        @Size(max = 1000, message = "A megjegyzés legfeljebb 1000 karakter.") String note) {
}
