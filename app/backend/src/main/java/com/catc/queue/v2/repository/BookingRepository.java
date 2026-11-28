package com.catc.queue.v2.repository;

import com.catc.queue.v2.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByStudentOrderByExamDateDescExamTimeDesc(Student student);
    List<Booking> findByProfessorOrderByExamDateDescExamTimeDesc(Professor professor);
    List<Booking> findByProfessorAndExamDateBetweenOrderByExamDateAscExamTimeAsc(Professor p, LocalDate from, LocalDate to);
    boolean existsByProfessorAndExamDateAndExamTimeAndStatus(Professor p, LocalDate d, LocalTime t, BookingStatus s);
    boolean existsByStudentAndProfessorAndSubjectIgnoreCaseAndExamDateAndExamTimeAndStatusIn(
            Student s, Professor p, String subject, LocalDate d, LocalTime t, List<BookingStatus> statuses);
    void deleteByStudent(Student student);
    void deleteByProfessor(Professor professor);
}
