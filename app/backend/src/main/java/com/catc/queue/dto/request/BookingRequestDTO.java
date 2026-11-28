
package com.catc.queue.dto.request;

import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.Map;

public record BookingRequestDTO(

    @NotBlank(message = "Booking ID is required")
    String id,

    @NotBlank(message = "Student ID is required")
    String studentId,

    @NotBlank(message = "Student name is required")
    String student,

    @NotBlank(message = "Professor ID is required")
    String professorId,

    @NotBlank(message = "Professor name is required")
    String professor,

    @NotBlank(message = "Subject is required")
    String subject,

    @NotBlank(message = "Exam date is required")
    String day,

    @NotBlank(message = "Exam time is required")
    String time,

    String msg,

    @NotBlank(message = "Status is required")
    String status,

    @NotBlank(message = "Reference number is required")
    String ref,

    Long at,

    List<Map<String, Object>> events

) {}
