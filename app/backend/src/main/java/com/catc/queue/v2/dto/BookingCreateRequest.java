package com.catc.queue.v2.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalTime;

public record BookingCreateRequest(
        @NotNull Long professorId,
        @NotBlank String subject,
        @NotNull @FutureOrPresent LocalDate examDate,
        @NotNull LocalTime examTime,
        @Size(max = 1000) String message) { }
