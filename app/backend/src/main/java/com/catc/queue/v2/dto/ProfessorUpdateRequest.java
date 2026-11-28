package com.catc.queue.v2.dto;

import java.util.Set;

/** Every field optional: only non-null fields are applied. */
public record ProfessorUpdateRequest(
        String name, String department, String about, String contacts, String semester,
        Set<String> subjects, Set<String> specialties, Set<String> coursesHandled,
        String profilePic) { }
