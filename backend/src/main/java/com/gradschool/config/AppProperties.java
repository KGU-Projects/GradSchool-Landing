package com.gradschool.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("app")
public record AppProperties(String jwtSecret, int jwtHours, String adminUsername, String adminPassword,
                            String corsOrigins, String uploadDir) {}
