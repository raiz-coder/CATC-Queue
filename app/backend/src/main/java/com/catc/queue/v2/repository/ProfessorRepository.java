package com.catc.queue.v2.repository;

import com.catc.queue.v2.entity.Professor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProfessorRepository extends JpaRepository<Professor, Long> {
    Optional<Professor> findByEmailIgnoreCase(String email);
    boolean existsByEmployeeId(String employeeId);
    boolean existsByEmailIgnoreCase(String email);
}
