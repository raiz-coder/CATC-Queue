package com.catc.queue.repository;
import com.catc.queue.entity.RequestRec;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
public interface RequestRepository extends JpaRepository<RequestRec,String> {
  boolean existsByRef(String ref);
  List<RequestRec> findByStudentId(String id);
  List<RequestRec> findByProfessorId(String id);
  void deleteByStudentIdOrProfessorId(String a,String b);
}
