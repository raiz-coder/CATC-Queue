package com.catc.queue.v2.controller;

import com.catc.queue.v2.dto.*;
import com.catc.queue.v2.service.ProfessorService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;

/** Professors catalog: any logged-in user (student, professor, admin) can browse it. */
@RestController
@RequestMapping("/api/v2/professors")
public class CatalogController {
    private final ProfessorService professors;

    public CatalogController(ProfessorService professors) { this.professors = professors; }

    @GetMapping
    public List<ProfessorCardDTO> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String specialty,
            @RequestParam(required = false) String courseYear,
            @RequestParam(required = false) String semester,
            @RequestParam(required = false) DayOfWeek day,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime time) {
        return professors.catalog(q, department, subject, specialty, courseYear, semester, day, time);
    }

    @GetMapping("/{id}")
    public ProfessorProfileDTO profile(@PathVariable Long id) { return professors.profile(id); }
}
