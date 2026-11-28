package com.catc.queue.v2.dto;

import com.catc.queue.v2.entity.ProfStatus;
import java.util.List;
import java.util.Set;

/** Public professor profile page. */
public record ProfessorProfileDTO(Long id, String name, String email, String department, String profilePic,
                                  String about, String contacts, ProfStatus status, String semester,
                                  Set<String> subjects, Set<String> specialties, Set<String> coursesHandled,
                                  List<AvailabilitySlotDTO> availability) { }
