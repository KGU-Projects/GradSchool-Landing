package com.gradschool.auth;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    record LoginRequest(@NotBlank String username, @NotBlank String password) {}
    record PasswordChange(@NotBlank String currentPassword, @NotBlank @Size(min = 8) String newPassword) {}

    private final AdminUserRepository repo;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthController(AdminUserRepository repo, PasswordEncoder encoder, JwtService jwt) {
        this.repo = repo; this.encoder = encoder; this.jwt = jwt;
    }

    @PostMapping("/login")
    public Map<String, String> login(@Valid @RequestBody LoginRequest req) {
        AdminUser u = repo.findByUsername(req.username())
                .filter(a -> encoder.matches(req.password(), a.getPasswordHash()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호가 올바르지 않습니다."));
        return Map.of("token", jwt.issue(u.getUsername()), "username", u.getUsername());
    }

    @GetMapping("/me")
    public Map<String, String> me(Principal p) {
        return Map.of("username", p.getName());
    }

    @PutMapping("/password")
    public void changePassword(Principal p, @Valid @RequestBody PasswordChange req) {
        AdminUser u = repo.findByUsername(p.getName()).orElseThrow();
        if (!encoder.matches(req.currentPassword(), u.getPasswordHash()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "현재 비밀번호가 일치하지 않습니다.");
        u.setPasswordHash(encoder.encode(req.newPassword()));
        repo.save(u);
    }
}
