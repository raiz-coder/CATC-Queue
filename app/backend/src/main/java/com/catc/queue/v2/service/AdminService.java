package com.catc.queue.v2.service;

import com.catc.queue.v2.dto.UserSummaryDTO;
import com.catc.queue.v2.entity.*;
import com.catc.queue.v2.exception.ApiException;
import com.catc.queue.v2.repository.*;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;

@Service
public class AdminService {
    private final StudentRepository students;
    private final ProfessorRepository professors;
    private final AdminRepository admins;
    private final BookingRepository bookings;
    private final AvailabilityRepository availability;

    public AdminService(StudentRepository students, ProfessorRepository professors, AdminRepository admins,
                        BookingRepository bookings, AvailabilityRepository availability) {
        this.students = students;
        this.professors = professors;
        this.admins = admins;
        this.bookings = bookings;
        this.availability = availability;
    }

   
public List<UserSummaryDTO> users(String role) {
    List<UserSummaryDTO> out = new ArrayList<>();
    boolean all = role == null || role.isBlank();

    if (!all
            && !role.equalsIgnoreCase("STUDENT")
            && !role.equalsIgnoreCase("PROFESSOR")
            && !role.equalsIgnoreCase("ADMIN")) {
        throw ApiException.badRequest("Unknown role: " + role);
    }

    if (all || role.equalsIgnoreCase("STUDENT")) {
        students.findAll().forEach(s -> out.add(
                new UserSummaryDTO("STUDENT", s.getId(), s.getStudentId(),
                        s.getFullName(), s.getEmail(), s.isEnabled())));
    }

    if (all || role.equalsIgnoreCase("PROFESSOR")) {
        professors.findAll().forEach(p -> out.add(
                new UserSummaryDTO("PROFESSOR", p.getId(), p.getEmployeeId(),
                        p.getName(), p.getEmail(), p.isEnabled())));
    }

    if (all || role.equalsIgnoreCase("ADMIN")) {
        admins.findAll().forEach(a -> out.add(
                new UserSummaryDTO("ADMIN", a.getId(), null,
                        a.getFullName(), a.getEmail(), a.isEnabled())));
    }

    return out;
}

    @Transactional
    public void setEnabled(String role, Long id, boolean enabled, Authentication auth) {
        switch (role.toUpperCase()) {
            case "STUDENT" -> students.findById(id).orElseThrow(() -> ApiException.notFound("Student not found.")).setEnabled(enabled);
            case "PROFESSOR" -> professors.findById(id).orElseThrow(() -> ApiException.notFound("Professor not found.")).setEnabled(enabled);
            case "ADMIN" -> {
                AdminAccount a = admins.findById(id).orElseThrow(() -> ApiException.notFound("Admin not found."));
                if (!enabled && a.getEmail().equalsIgnoreCase(auth.getName()))
                    throw ApiException.badRequest("You cannot disable your own account.");
                a.setEnabled(enabled);
            }
            default -> throw ApiException.badRequest("Unknown role: " + role);
        }
    }

    @Transactional
    public void delete(String role, Long id, Authentication auth) {
        switch (role.toUpperCase()) {
            case "STUDENT" -> {
                Student s = students.findById(id).orElseThrow(() -> ApiException.notFound("Student not found."));
                bookings.deleteByStudent(s);
                students.delete(s);
            }
            case "PROFESSOR" -> {
                Professor p = professors.findById(id).orElseThrow(() -> ApiException.notFound("Professor not found."));
                bookings.deleteByProfessor(p);
                availability.deleteByProfessor(p);
                professors.delete(p);
            }
            case "ADMIN" -> {
                AdminAccount a = admins.findById(id).orElseThrow(() -> ApiException.notFound("Admin not found."));
                if (a.getEmail().equalsIgnoreCase(auth.getName()))
                    throw ApiException.badRequest("You cannot delete your own account.");
                admins.delete(a);
            }
            default -> throw ApiException.badRequest("Unknown role: " + role);
        }
    }
}
