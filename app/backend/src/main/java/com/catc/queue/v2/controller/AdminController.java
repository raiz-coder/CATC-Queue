package com.catc.queue.v2.controller;

import com.catc.queue.v2.dto.*;
import com.catc.queue.v2.service.AccountService;
import com.catc.queue.v2.service.AdminService;
import com.catc.queue.v2.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v2/admin")
public class AdminController {
    private final AdminService admin;
    private final AccountService accounts;
    private final BookingService bookings;

    public AdminController(AdminService admin, AccountService accounts, BookingService bookings) {
        this.admin = admin;
        this.accounts = accounts;
        this.bookings = bookings;
    }

    @GetMapping("/users")
    public List<UserSummaryDTO> users(@RequestParam(required = false) String role) { return admin.users(role); }

    @PostMapping("/users/admins")
    public ResponseEntity<UserSummaryDTO> createAdmin(@Valid @RequestBody CreateAdminRequest r) {
        return ResponseEntity.status(HttpStatus.CREATED).body(accounts.createAdmin(r));
    }

    /** Activate / deactivate: PATCH /users/STUDENT/5/enabled?value=false */
    @PatchMapping("/users/{role}/{id}/enabled")
    public ResponseEntity<Void> enable(@PathVariable String role, @PathVariable Long id,
                                       @RequestParam boolean value, Authentication a) {
        admin.setEnabled(role, id, value, a);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/users/{role}/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String role, @PathVariable Long id, Authentication a) {
        admin.delete(role, id, a);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/bookings")
    public List<BookingDTO> allBookings() { return bookings.all(); }

    @DeleteMapping("/bookings/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id) {
        bookings.adminDelete(id);
        return ResponseEntity.noContent().build();
    }
}
