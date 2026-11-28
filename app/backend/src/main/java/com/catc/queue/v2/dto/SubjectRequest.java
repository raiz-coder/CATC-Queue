package com.catc.queue.v2.dto;

import jakarta.validation.constraints.NotBlank;

public record SubjectRequest(@NotBlank String subject) { }
