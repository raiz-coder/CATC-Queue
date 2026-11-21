package com.catc.queue.repository;
import com.catc.queue.entity.Account;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
public interface AccountRepository extends JpaRepository<Account,String> {
  Optional<Account> findByEmail(String email);
  boolean existsByEmail(String email);
  boolean existsBySidIgnoreCase(String sid);
  boolean existsByEmpIdIgnoreCase(String empId);
  @Query("select a from Account a where a.email=lower(:i) or lower(a.sid)=lower(:i) or lower(a.empId)=lower(:i)")
  Optional<Account> findByIdent(@Param("i") String ident);
}
