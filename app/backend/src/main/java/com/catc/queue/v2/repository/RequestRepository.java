package com.catc.queue.v2.repository;
import com.catc.queue.v2.entity.RequestRec;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
public interface RequestRepository extends JpaRepository<RequestRec,String> {
  boolean existsByRef(String ref);
  List<RequestRec> findByStudentId(String id);
  List<RequestRec> findByProfessorId(String id);
  void deleteByStudentIdOrProfessorId(String a,String b);
}
