package com.paintball.app.auth;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

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

    public record LoginRequest(@NotBlank String username, @NotBlank String password) {
    }
}
