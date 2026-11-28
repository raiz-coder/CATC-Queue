package com.catc.queue.v2.dto;

import com.catc.queue.v2.entity.BookingStatus;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

public record BookingDTO(Long id, BookingStatus status, String subject, LocalDate examDate, LocalTime examTime,
                         String message, String referenceReq,
                         Long studentPk, String studentId, String studentName, String courseYear,
                         Long professorId, String professorName, String department,
                         LocalDate proposedDate, LocalTime proposedTime, String professorNote, Instant createdAt) { }
