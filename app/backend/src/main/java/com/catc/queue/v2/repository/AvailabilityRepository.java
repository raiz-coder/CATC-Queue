package com.catc.queue.v2.repository;

import com.catc.queue.v2.entity.AvailabilitySlot;
import com.catc.queue.v2.entity.Professor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AvailabilityRepository extends JpaRepository<AvailabilitySlot, Long> {
    List<AvailabilitySlot> findByProfessorOrderByDayOfWeekAscStartTimeAsc(Professor professor);
    void deleteByProfessor(Professor professor);
}
