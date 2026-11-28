package com.catc.queue.v2.dto;

import jakarta.validation.constraints.*;

public record CreateAdminRequest(
        @NotBlank String fullName,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, max = 100) String password) { }
