package com.paintball.app.auth;

import java.time.Clock;
import java.time.Instant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.paintball.app.config.AppProperties;

/**
 * Creates the first admin user from configuration (ADMIN_USERNAME / ADMIN_PASSWORD) when the
 * admin table is empty, so a fresh deployment can be logged into without manual SQL.
 */
@Component
public class AdminBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);

    private final AdminUserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final AppProperties.Security settings;
    private final Clock clock;

    public AdminBootstrap(AdminUserRepository repository, PasswordEncoder passwordEncoder, AppProperties properties,
            Clock clock) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.settings = properties.security();
        this.clock = clock;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (repository.count() > 0) {
            return;
        }
        if (!StringUtils.hasText(settings.bootstrapUsername()) || !StringUtils.hasText(settings.bootstrapPassword())) {
            log.warn("No admin user exists and ADMIN_USERNAME / ADMIN_PASSWORD are not set; dashboard login is impossible.");
            return;
        }
        AdminUser admin = new AdminUser();
        admin.setUsername(settings.bootstrapUsername());
        admin.setPasswordHash(passwordEncoder.encode(settings.bootstrapPassword()));
        admin.setCreatedAt(Instant.now(clock));
        repository.save(admin);
        log.info("Created initial admin user '{}'.", admin.getUsername());
    }
}
