package com.catc.queue.v2.dto;

import com.catc.queue.v2.entity.Theme;
import java.time.LocalDate;
import java.util.Set;

/** Student's own view (includes referenceReq and theme). */
public record StudentDTO(Long id, String studentId, String fullName, String email, String courseYear,
                         String referenceReq, String profilePic, String about, LocalDate birthday,
                         Set<String> interestedSubjects, Set<String> accomplishments,
                         String contacts, Theme theme) { }
