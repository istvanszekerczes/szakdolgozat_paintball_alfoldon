package com.paintball.app.auth;

import java.time.Clock;
import java.time.Instant;
import java.util.List;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import com.paintball.app.config.AppProperties;

/** Issues signed admin tokens; SecurityConfig verifies them on every /api/admin request. */
@Service
public class TokenService {

    static final String ISSUER = "paintball-alfoldon";
    static final String ROLES_CLAIM = "roles";

    private final JwtEncoder encoder;
    private final AppProperties.Security settings;
    private final Clock clock;

    public TokenService(JwtEncoder encoder, AppProperties properties, Clock clock) {
        this.encoder = encoder;
        this.settings = properties.security();
        this.clock = clock;
    }

    public LoginResponse issue(AdminUser user) {
        Instant now = Instant.now(clock);
        Instant expiresAt = now.plus(settings.tokenTtl());
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(ISSUER)
                .subject(user.getUsername())
                .issuedAt(now)
                .expiresAt(expiresAt)
                .claim(ROLES_CLAIM, List.of("ADMIN"))
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        String token = encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
        return new LoginResponse(token, expiresAt);
    }

    public record LoginResponse(String token, Instant expiresAt) {
    }
}
