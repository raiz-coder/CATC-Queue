package com.catc.queue.v2.dto;

import jakarta.validation.constraints.NotNull;
import java.time.DayOfWeek;
import java.time.LocalTime;

public record AvailabilitySlotDTO(Long id, @NotNull DayOfWeek dayOfWeek,
                                  @NotNull LocalTime startTime, @NotNull LocalTime endTime) { }
