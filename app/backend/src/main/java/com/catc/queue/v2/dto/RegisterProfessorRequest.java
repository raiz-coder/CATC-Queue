package com.catc.queue.v2.dto;

import jakarta.validation.constraints.*;

public record RegisterProfessorRequest(
        @NotBlank @Size(max = 40) String employeeId,
        @NotBlank String name,
        @NotBlank @Email String email,
        @NotBlank String department,
        @NotBlank String reference,
        @NotBlank @Size(min = 8, max = 100) String password,
        String profilePic) { }
