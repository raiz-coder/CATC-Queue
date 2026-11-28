package com.catc.queue.v2.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Wraps BCrypt so we do not publish a second PasswordEncoder bean
 * that could clash with the one in your existing security config.
 */
@Component
public class PasswordHasher {
    private final PasswordEncoder encoder = new BCryptPasswordEncoder();
    public String hash(String raw) { return encoder.encode(raw); }
    public PasswordEncoder encoder() { return encoder; }
}
