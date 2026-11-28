package com.catc.queue.v2.dto;

import java.time.LocalDate;
import java.util.Set;

/** What a professor sees: no referenceReq (professor must know it to confirm). */
public record StudentProfileDTO(Long id, String studentId, String fullName, String email, String courseYear,
                                String profilePic, String about, LocalDate birthday,
                                Set<String> interestedSubjects, Set<String> accomplishments, String contacts) { }
