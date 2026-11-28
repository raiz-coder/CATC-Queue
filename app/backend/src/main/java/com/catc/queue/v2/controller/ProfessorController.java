package com.catc.queue.v2.controller;

import com.catc.queue.v2.dto.*;
import com.catc.queue.v2.service.BookingService;
import com.catc.queue.v2.service.ProfessorService;
import com.catc.queue.v2.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v2/professor")
public class ProfessorController {
    private final ProfessorService professors;
    private final BookingService bookings;
    private final StudentService students;

    public ProfessorController(ProfessorService professors, BookingService bookings, StudentService students) {
        this.professors = professors;
        this.bookings = bookings;
        this.students = students;
    }

    // ----- profile, status, theme -----
    @GetMapping("/me")
    public ProfessorDTO me(Authentication a) { return professors.me(a.getName()); }

    @PutMapping("/me")
    public ProfessorDTO update(Authentication a, @Valid @RequestBody ProfessorUpdateRequest r) {
        return professors.update(a.getName(), r);
    }

    /** GREEN / YELLOW / RED */
    @PutMapping("/me/status")
    public ProfessorDTO status(Authentication a, @Valid @RequestBody StatusUpdateRequest r) {
        return professors.setStatus(a.getName(), r.status());
    }

    @PutMapping("/me/theme")
    public ProfessorDTO theme(Authentication a, @Valid @RequestBody ThemeRequest r) {
        return professors.setTheme(a.getName(), r.theme());
    }

    @PostMapping("/me/subjects")
    public ProfessorDTO addSubject(Authentication a, @Valid @RequestBody SubjectRequest r) {
        return professors.addSubject(a.getName(), r.subject());
    }

    @DeleteMapping("/me/subjects")
    public ProfessorDTO removeSubject(Authentication a, @RequestParam String subject) {
        return professors.removeSubject(a.getName(), subject);
    }

    // ----- scheduling (availability) -----
    @GetMapping("/me/availability")
    public List<AvailabilitySlotDTO> slots(Authentication a) { return professors.slots(a.getName()); }

    @PostMapping("/me/availability")
    public ResponseEntity<AvailabilitySlotDTO> addSlot(Authentication a, @Valid @RequestBody AvailabilitySlotDTO r) {
        return ResponseEntity.status(HttpStatus.CREATED).body(professors.addSlot(a.getName(), r));
    }

    @DeleteMapping("/me/availability/{id}")
    public ResponseEntity<Void> deleteSlot(Authentication a, @PathVariable Long id) {
        professors.deleteSlot(a.getName(), id);
        return ResponseEntity.noContent().build();
    }

    // ----- bookings -----
    /** ?view=ALL|PENDING|TODAY|UPCOMING|CURRENT|ACCOMPLISHED|HISTORY */
    @GetMapping("/bookings")
    public List<BookingDTO> list(Authentication a, @RequestParam(defaultValue = "ALL") String view) {
        return bookings.professorBookings(a.getName(), view);
    }

    /** Calendar of activity for the Home page. */
    @GetMapping("/bookings/calendar")
    public List<BookingDTO> calendar(Authentication a,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return bookings.calendar(a.getName(), from, to);
    }

    @PostMapping("/bookings/{id}/accept")
    public BookingDTO accept(Authentication a, @PathVariable Long id, @Valid @RequestBody ConfirmBookingRequest r) {
        return bookings.accept(a.getName(), id, r);
    }

    @PostMapping("/bookings/{id}/decline")
    public BookingDTO decline(Authentication a, @PathVariable Long id, @RequestBody DeclineRequest r) {
        return bookings.decline(a.getName(), id, r);
    }

    @PostMapping("/bookings/{id}/approve-cancel")
    public BookingDTO approveCancel(Authentication a, @PathVariable Long id) { return bookings.approveCancel(a.getName(), id); }

    @PostMapping("/bookings/{id}/reject-cancel")
    public BookingDTO rejectCancel(Authentication a, @PathVariable Long id) { return bookings.rejectCancel(a.getName(), id); }

    @PostMapping("/bookings/{id}/complete")
    public BookingDTO complete(Authentication a, @PathVariable Long id) { return bookings.complete(a.getName(), id); }

    // ----- students -----
    /** Search by student ID or name. */
    @GetMapping("/students")
    public List<StudentProfileDTO> searchStudents(@RequestParam(required = false) String q) { return students.search(q); }

    @GetMapping("/students/{id}")
    public StudentProfileDTO student(@PathVariable Long id) { return students.profile(id); }
}
