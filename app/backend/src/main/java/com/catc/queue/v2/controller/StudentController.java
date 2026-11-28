
package com.catc.queue.v2.controller;

import com.catc.queue.v2.dto.*;
import com.catc.queue.v2.service.BookingService;
import com.catc.queue.v2.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v2/student")
public class StudentController {

    private final StudentService students;
    private final BookingService bookings;

    public StudentController(StudentService students, BookingService bookings) {
        this.students = students;
        this.bookings = bookings;
    }

    @GetMapping("/me")
    public StudentDTO me(Authentication auth) {
        return students.me(auth.getName());
    }

    @PutMapping("/me")
    public StudentDTO update(
            Authentication auth,
            @Valid @RequestBody StudentUpdateRequest r) {
        return students.update(auth.getName(), r);
    }

    @PutMapping("/me/theme")
    public StudentDTO theme(
            Authentication auth,
            @Valid @RequestBody ThemeRequest r) {
        return students.setTheme(auth.getName(), r.theme());
    }

    @PostMapping("/bookings")
    public ResponseEntity<BookingDTO> book(
            Authentication auth,
            @Valid @RequestBody BookingCreateRequest r) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookings.create(auth.getName(), r));
    }

    @GetMapping("/bookings")
    public List<BookingDTO> list(
            Authentication auth,
            @RequestParam(defaultValue = "ALL") String view) {
        return bookings.studentBookings(auth.getName(), view);
    }

    @PostMapping("/bookings/{id}/cancel")
    public BookingDTO cancel(
            Authentication auth,
            @PathVariable Long id) {
        return bookings.studentCancel(auth.getName(), id);
    }

    @PostMapping("/bookings/{id}/accept-reschedule")
    public BookingDTO acceptReschedule(
            Authentication auth,
            @PathVariable Long id) {
        return bookings.studentAcceptReschedule(auth.getName(), id);
    }
}
