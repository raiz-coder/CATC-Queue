package com.catc.queue.v2.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalTime;

/** What the professor must type to accept a request. referenceReq must match the student's record exactly. */
public record ConfirmBookingRequest(
        @NotBlank String referenceReq,
        @NotBlank String subject,
        @NotNull LocalDate examDate,
        @NotNull LocalTime examTime,
        @NotBlank String studentName,
        @NotBlank String studentId) { }
