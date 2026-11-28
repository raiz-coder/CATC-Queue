package com.catc.queue.v2.dto;

public record UserSummaryDTO(String role, Long id, String schoolId, String name, String email, boolean enabled) { }
