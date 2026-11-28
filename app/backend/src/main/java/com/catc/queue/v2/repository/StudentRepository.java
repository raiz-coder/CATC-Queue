package com.catc.queue.v2.repository;

import com.catc.queue.v2.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByEmailIgnoreCase(String email);
    boolean existsByStudentId(String studentId);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByReferenceReq(String referenceReq);
    boolean existsByFullNameIgnoreCaseAndCourseYearIgnoreCase(String fullName, String courseYear);
}
