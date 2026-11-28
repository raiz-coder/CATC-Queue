package com.catc.queue.v2.service;

import com.catc.queue.v2.dto.*;
import com.catc.queue.v2.entity.*;
import com.catc.queue.v2.exception.ApiException;
import com.catc.queue.v2.repository.*;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AccountService {
    private final StudentRepository students;
    private final ProfessorRepository professors;
    private final AdminRepository admins;
    private final PasswordHasher hasher;

    public AccountService(StudentRepository students, ProfessorRepository professors,
                          AdminRepository admins, PasswordHasher hasher) {
        this.students = students;
        this.professors = professors;
        this.admins = admins;
        this.hasher = hasher;
    }

    /** An e-mail may exist only once across students, professors and admins. */
    private void assertEmailFree(String email) {
        if (students.existsByEmailIgnoreCase(email) || professors.existsByEmailIgnoreCase(email)
                || admins.existsByEmailIgnoreCase(email)) {
            throw ApiException.conflict("Email is already registered.");
        }
    }

    @Transactional
    public StudentDTO registerStudent(RegisterStudentRequest r) {
        String email = r.email().trim().toLowerCase();
        assertEmailFree(email);
        if (students.existsByStudentId(r.studentId().trim()))
            throw ApiException.conflict("Student ID is already registered.");
        if (students.existsByReferenceReq(r.referenceReq().trim()))
            throw ApiException.conflict("Reference request number already belongs to another account.");
        if (students.existsByFullNameIgnoreCaseAndCourseYearIgnoreCase(r.fullName().trim(), r.courseYear().trim()))
            throw ApiException.conflict("A similar account (same name and course/year) already exists.");

        Student s = new Student();
        s.setStudentId(r.studentId().trim());
        s.setFullName(r.fullName().trim());
        s.setEmail(email);
        s.setCourseYear(r.courseYear().trim());
        s.setReferenceReq(r.referenceReq().trim());
        s.setProfilePic(r.profilePic());
        s.setPassword(hasher.hash(r.password()));
        return DtoMapper.student(students.save(s));
    }

    @Transactional
    public ProfessorDTO registerProfessor(RegisterProfessorRequest r) {
        String email = r.email().trim().toLowerCase();
        assertEmailFree(email);
        if (professors.existsByEmployeeId(r.employeeId().trim()))
            throw ApiException.conflict("Employee ID is already registered.");

        Professor p = new Professor();
        p.setEmployeeId(r.employeeId().trim());
        p.setName(r.name().trim());
        p.setEmail(email);
        p.setDepartment(r.department().trim());
        p.setReference(r.reference().trim());
        p.setProfilePic(r.profilePic());
        p.setPassword(hasher.hash(r.password()));
        return DtoMapper.professor(professors.save(p));
    }

    @Transactional
    public UserSummaryDTO createAdmin(CreateAdminRequest r) {
        String email = r.email().trim().toLowerCase();
        assertEmailFree(email);
        AdminAccount a = new AdminAccount();
        a.setFullName(r.fullName().trim());
        a.setEmail(email);
        a.setPassword(hasher.hash(r.password()));
        a = admins.save(a);
        return new UserSummaryDTO("ADMIN", a.getId(), null, a.getFullName(), a.getEmail(), a.isEnabled());
    }

    public AuthUserDTO me(Authentication auth) {
        String email = auth.getName();
        boolean student = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT"));
        boolean prof = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_PROFESSOR"));
        if (student) {
            Student s = students.findByEmailIgnoreCase(email).orElseThrow(() -> ApiException.notFound("Account not found."));
            return new AuthUserDTO("STUDENT", s.getId(), s.getFullName(), s.getEmail());
        }
        if (prof) {
            Professor p = professors.findByEmailIgnoreCase(email).orElseThrow(() -> ApiException.notFound("Account not found."));
            return new AuthUserDTO("PROFESSOR", p.getId(), p.getName(), p.getEmail());
        }
        AdminAccount a = admins.findByEmailIgnoreCase(email).orElseThrow(() -> ApiException.notFound("Account not found."));
        return new AuthUserDTO("ADMIN", a.getId(), a.getFullName(), a.getEmail());
    }
}
