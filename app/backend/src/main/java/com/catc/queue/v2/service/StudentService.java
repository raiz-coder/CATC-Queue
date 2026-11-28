package com.catc.queue.v2.service;

import com.catc.queue.v2.dto.*;
import com.catc.queue.v2.entity.*;
import com.catc.queue.v2.exception.ApiException;
import com.catc.queue.v2.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Locale;

@Service
public class StudentService {
    private final StudentRepository students;

    public StudentService(StudentRepository students) { this.students = students; }

    public Student byEmail(String email) {
        return students.findByEmailIgnoreCase(email).orElseThrow(() -> ApiException.notFound("Student not found."));
    }

    public StudentDTO me(String email) { return DtoMapper.student(byEmail(email)); }

    @Transactional
    public StudentDTO update(String email, StudentUpdateRequest r) {
        Student s = byEmail(email);
        if (r.fullName() != null && !r.fullName().isBlank()) s.setFullName(r.fullName().trim());
        if (r.courseYear() != null && !r.courseYear().isBlank()) s.setCourseYear(r.courseYear().trim());
        if (r.about() != null) s.setAbout(r.about());
        if (r.birthday() != null) s.setBirthday(r.birthday());
        if (r.contacts() != null) s.setContacts(r.contacts());
        if (r.profilePic() != null) s.setProfilePic(r.profilePic());
        if (r.interestedSubjects() != null) { s.getInterestedSubjects().clear(); s.getInterestedSubjects().addAll(r.interestedSubjects()); }
        if (r.accomplishments() != null) { s.getAccomplishments().clear(); s.getAccomplishments().addAll(r.accomplishments()); }
        return DtoMapper.student(s);
    }

    @Transactional
    public StudentDTO setTheme(String email, Theme theme) {
        Student s = byEmail(email);
        s.setTheme(theme);
        return DtoMapper.student(s);
    }

    /** Professor-facing: view one student's profile. */
    public StudentProfileDTO profile(Long id) {
        return DtoMapper.studentProfile(students.findById(id).orElseThrow(() -> ApiException.notFound("Student not found.")));
    }

    /** Professor-facing: search by student ID or name. */
    public List<StudentProfileDTO> search(String q) {
        String needle = q == null ? "" : q.trim().toLowerCase(Locale.ROOT);
        return students.findAll().stream()
                .filter(Student::isEnabled)
                .filter(s -> needle.isEmpty()
                        || s.getStudentId().toLowerCase(Locale.ROOT).contains(needle)
                        || s.getFullName().toLowerCase(Locale.ROOT).contains(needle))
                .map(DtoMapper::studentProfile).toList();
    }
}
