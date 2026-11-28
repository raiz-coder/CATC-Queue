package com.catc.queue.v2.dto;

import com.catc.queue.v2.entity.ProfStatus;
import com.catc.queue.v2.entity.Theme;
import java.util.Set;

/** Professor's own view. */
public record ProfessorDTO(Long id, String employeeId, String name, String email, String reference,
                           String department, String profilePic, String about, String contacts,
                           ProfStatus status, String semester, Set<String> subjects,
                           Set<String> specialties, Set<String> coursesHandled, Theme theme) { }
