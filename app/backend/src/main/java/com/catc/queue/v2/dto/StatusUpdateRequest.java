package com.catc.queue.v2.dto;

import com.catc.queue.v2.entity.ProfStatus;
import jakarta.validation.constraints.NotNull;

public record StatusUpdateRequest(@NotNull ProfStatus status) { }
