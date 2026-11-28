package com.catc.queue.v2.dto;

import jakarta.validation.constraints.PastOrPresent;
import java.time.LocalDate;
import java.util.Set;

/** Every field optional: only non-null fields are applied. */
public record StudentUpdateRequest(
        String fullName, String courseYear, String about,
        @PastOrPresent LocalDate birthday,
        Set<String> interestedSubjects, Set<String> accomplishments,
        String contacts, String profilePic) { }
