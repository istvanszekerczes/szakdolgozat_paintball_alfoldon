package com.paintball.app.auth;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.paintball.app.common.BookingRuleException;

/** Dashboard login. Lives under /api/admin so only the dashboard origin can call it from a browser. */
@RestController
@RequestMapping("/api/admin/auth")
public class AuthController {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    public AuthController(AdminUserRepository adminUserRepository, PasswordEncoder passwordEncoder,
            TokenService tokenService) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
    }

    @PostMapping("/login")
    public TokenService.LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return adminUserRepository.findByUsername(request.username())
                .filter(AdminUser::isEnabled)
                .filter(user -> passwordEncoder.matches(request.password(), user.getPasswordHash()))
                .map(tokenService::issue)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                        "Hibás felhasználónév vagy jelszó."));
    }

    /** Password change of the signed-in admin (Beállítások). Needs the current password as well. */
    @PostMapping("/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void changePassword(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody PasswordChange request) {
        AdminUser user = adminUserRepository.findByUsername(jwt.getSubject())
                .filter(AdminUser::isEnabled)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BookingRuleException("A jelenlegi jelszó nem megfelelő.");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
    }

    public record LoginRequest(@NotBlank String username, @NotBlank String password) {
    }

    public record PasswordChange(
            @NotBlank(message = "Add meg a jelenlegi jelszót.") String currentPassword,
            @NotBlank @Size(min = 8, max = 100, message = "Az új jelszó legalább 8 karakter legyen.") String newPassword) {
    }
}
