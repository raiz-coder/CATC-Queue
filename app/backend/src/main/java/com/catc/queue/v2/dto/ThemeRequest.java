package com.catc.queue.v2.dto;

import com.catc.queue.v2.entity.Theme;
import jakarta.validation.constraints.NotNull;

public record ThemeRequest(@NotNull Theme theme) { }
