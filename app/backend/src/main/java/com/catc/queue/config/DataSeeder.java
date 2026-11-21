package com.catc.queue.config;
import com.catc.queue.entity.Account;
import com.catc.queue.repository.AccountRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;
@Configuration
public class DataSeeder {
  @Bean CommandLineRunner seed(AccountRepository r,PasswordEncoder enc){
    return x -> { if(r.count()>0) return;
      add(r,enc,"admin","admin@catc.edu",null,null,"admin","admin123","{\"name\":\"Admin\",\"email\":\"admin@catc.edu\",\"done\":true,\"subjects\":[]}");
      add(r,enc,"demo-s","student@catc.edu","2024-0001",null,"student","student123","{\"name\":\"Juan Reyes\",\"email\":\"student@catc.edu\",\"sid\":\"2024-0001\",\"course\":\"BSIT-3\",\"done\":true,\"subjects\":[\"Programming\"],\"hours\":5}");
      add(r,enc,"demo-t","prof@catc.edu",null,"E-001","professor","prof123","{\"name\":\"Ana Dela Cruz\",\"email\":\"prof@catc.edu\",\"empId\":\"E-001\",\"dept\":\"IT\",\"status\":\"GREEN\",\"done\":true,\"subjects\":[\"Programming\",\"Databases\"],\"bio\":\"Handles IT make-up exams.\",\"exp\":\"5 yrs\",\"cemail\":\"prof@catc.edu\",\"phone\":\"0917 111 2222\",\"avail\":{\"days\":[\"Mon\",\"Tue\",\"Wed\",\"Thu\",\"Fri\"],\"from\":\"09:00\",\"to\":\"15:00\"}}");
    };
  }
  private void add(AccountRepository r,PasswordEncoder e,String id,String email,String sid,String emp,String role,String pw,String profile){
    Account a=new Account(); a.id=id; a.email=email; a.sid=sid; a.empId=emp; a.role=role; a.pw=e.encode(pw); a.profile=profile; r.save(a);
  }
}
