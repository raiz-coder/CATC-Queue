package com.catc.queue.v2.dto;

import com.catc.queue.v2.entity.ProfStatus;
import java.util.List;
import java.util.Set;

/** Row in the Professors catalog (Home page). */
public record ProfessorCardDTO(Long id, String name, String department, String profilePic,
                               ProfStatus status, List<String> schedule, Set<String> subjects) { }
