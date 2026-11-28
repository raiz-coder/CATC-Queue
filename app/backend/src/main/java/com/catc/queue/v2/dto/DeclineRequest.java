package com.catc.queue.v2.dto;

import java.time.LocalDate;
import java.time.LocalTime;

/** reschedule=true -> the "Yes" button (propose a new slot); false -> "Quit" (plain decline). */
public record DeclineRequest(boolean reschedule, LocalDate proposedDate, LocalTime proposedTime, String note) { }
