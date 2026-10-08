package com.gradschool.auth;

import com.gradschool.config.AppProperties;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Optional;

@Service
public class JwtService {
    private final SecretKey key;
    private final long ttlMs;

    public JwtService(AppProperties p) {
        this.key = Keys.hmacShaKeyFor(p.jwtSecret().getBytes(StandardCharsets.UTF_8));
        this.ttlMs = p.jwtHours() * 3600_000L;
    }

    public String issue(String username) {
        Date now = new Date();
        return Jwts.builder().subject(username).issuedAt(now)
                .expiration(new Date(now.getTime() + ttlMs)).signWith(key).compact();
    }

    public Optional<String> verify(String token) {
        try {
            return Optional.of(Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().getSubject());
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
