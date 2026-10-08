package com.gradschool.auth;

import jakarta.persistence.*;

@Entity
public class AdminUser {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false)
    private String username;
    @Column(nullable = false)
    private String passwordHash;

    protected AdminUser() {}
    public AdminUser(String username, String passwordHash) { this.username = username; this.passwordHash = passwordHash; }

    public String getUsername() { return username; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String h) { this.passwordHash = h; }
}
