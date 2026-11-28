package com.catc.queue.v2.controller;

import com.catc.queue.v2.dto.*;
import com.catc.queue.v2.service.AccountService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v2/auth")
public class AuthController {
    private final AccountService accounts;

    public AuthController(AccountService accounts) { this.accounts = accounts; }

    @PostMapping("/register/student")
    public ResponseEntity<StudentDTO> registerStudent(@Valid @RequestBody RegisterStudentRequest r) {
        return ResponseEntity.status(HttpStatus.CREATED).body(accounts.registerStudent(r));
    }

    @PostMapping("/register/professor")
    public ResponseEntity<ProfessorDTO> registerProfessor(@Valid @RequestBody RegisterProfessorRequest r) {
        return ResponseEntity.status(HttpStatus.CREATED).body(accounts.registerProfessor(r));
    }

    /** "Login": send HTTP Basic credentials; returns who you are and your role (use it to route to the right portal). */
    @GetMapping("/me")
    public AuthUserDTO me(Authentication auth) { return accounts.me(auth); }
}
