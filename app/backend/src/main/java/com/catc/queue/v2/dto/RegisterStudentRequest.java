package com.catc.queue.v2.dto;

import jakarta.validation.constraints.*;

public record RegisterStudentRequest(
        @NotBlank @Size(max = 40) String studentId,
        @NotBlank String fullName,
        @NotBlank @Email String email,
        @NotBlank String courseYear,
        @NotBlank String referenceReq,
        @NotBlank @Size(min = 8, max = 100) String password,
        String profilePic) { }
