package com.catc.queue.controller;
import com.catc.queue.entity.*;
import com.catc.queue.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
@RestController @RequestMapping("/api")
public class DataController {
  private final AccountRepository accounts; private final RequestRepository requests; private final PasswordEncoder enc; private final ObjectMapper om;
  public DataController(AccountRepository a,RequestRepository r,PasswordEncoder e,ObjectMapper o){accounts=a;requests=r;enc=e;om=o;}
  private ResponseStatusException err(HttpStatus s,String m){ return new ResponseStatusException(s,m); }
  private ObjectNode json(String s){ try { return (ObjectNode) om.readTree(s); } catch(Exception e){ throw new IllegalStateException(e); } }
  private ObjectNode profile(Account a){ ObjectNode n=json(a.profile); n.put("id",a.id); n.put("role",a.role); return n; }
  private Account me(Authentication au){ return accounts.findById(au.getName()).orElseThrow(()->err(HttpStatus.UNAUTHORIZED,"Unknown account")); }

  @ExceptionHandler(DataIntegrityViolationException.class)
  ResponseEntity<Map<String,String>> conflict(){ return ResponseEntity.status(409).body(Map.of("message","That email or ID already belongs to another account")); }

  /** Two sign-up types: role "student" (needs sid) or "professor" (needs empId). */
  @PostMapping("/auth/register") public Map<String,String> register(@RequestBody ObjectNode b){
    String role=b.path("role").asText(), email=b.path("email").asText().trim().toLowerCase(), pw=b.path("password").asText();
    boolean st=role.equals("student");
    if(!(st||role.equals("professor"))||email.isBlank()||pw.length()<6) throw err(HttpStatus.BAD_REQUEST,"Invalid sign-up details");
    String sid=st?b.path("sid").asText().trim():null, emp=st?null:b.path("empId").asText().trim();
    if((st?sid:emp).isBlank()) throw err(HttpStatus.BAD_REQUEST,"ID is required");
    if(accounts.existsByEmail(email)||(st&&accounts.existsBySidIgnoreCase(sid))||(!st&&accounts.existsByEmpIdIgnoreCase(emp)))
      throw err(HttpStatus.CONFLICT,"That email or ID already has an account");
    Account a=new Account(); a.id="u"+System.nanoTime(); a.email=email; a.sid=sid; a.empId=emp; a.role=role; a.pw=enc.encode(pw);
    b.remove("password"); b.remove("role"); b.put("email",email); b.put("done",false); b.putArray("subjects");
    a.profile=b.toString(); accounts.save(a); return Map.of("id",a.id);
  }
  /** Everything the signed-in user may see. Logging in = calling this with Basic credentials. */
  @GetMapping("/data") public Map<String,Object> data(Authentication au){
    Account me=me(au); boolean admin=me.role.equals("admin"), student=me.role.equals("student");
    List<RequestRec> rs=admin?requests.findAll():student?requests.findByStudentId(me.id):requests.findByProfessorId(me.id);
    Set<String> ids=new HashSet<>(List.of(me.id)); rs.forEach(r->{ids.add(r.studentId);ids.add(r.professorId);});
    List<ObjectNode> users=accounts.findAll().stream().filter(a->admin||ids.contains(a.id)||(student&&a.role.equals("professor"))).map(this::profile).toList();
    return Map.of("me",me.id,"users",users,"requests",rs.stream().map(r->json(r.json)).toList());
  }
  @PutMapping("/users/me") public void updateMe(Authentication au,@RequestBody ObjectNode b){
    Account a=me(au); b.remove("pw"); b.remove("password"); b.put("id",a.id); b.put("role",a.role);
    String email=b.path("email").asText(a.email).trim().toLowerCase();
    accounts.findByEmail(email).filter(x->!x.id.equals(a.id)).ifPresent(x->{ throw err(HttpStatus.CONFLICT,"That email belongs to another account"); });
    a.email=email; b.put("email",email);
    if(a.role.equals("student")) a.sid=b.path("sid").asText(null);
    if(a.role.equals("professor")) a.empId=b.path("empId").asText(null);
    a.profile=b.toString(); accounts.save(a);
  }
  @PutMapping("/requests/{id}") public void putRequest(Authentication au,@PathVariable String id,@RequestBody ObjectNode b){
    Account me=me(au); RequestRec old=requests.findById(id).orElse(null);
    boolean student=me.role.equals("student"), prof=me.role.equals("professor"), admin=me.role.equals("admin");
    String sid=old!=null?old.studentId:b.path("studentId").asText(), pid=old!=null?old.professorId:b.path("professorId").asText();
    String before=old!=null?json(old.json).path("status").asText():"", status=b.path("status").asText();
    if(!(admin||(student&&me.id.equals(sid))||(prof&&me.id.equals(pid)))||(old==null&&!student)) throw err(HttpStatus.FORBIDDEN,"Not allowed");
    if(old==null){ if(!status.equals("pending")) throw err(HttpStatus.BAD_REQUEST,"New bookings start as pending"); String ref=b.path("ref").asText(""); if(ref.isBlank()||requests.existsByRef(ref)) ref="CQ-"+Long.toString(System.nanoTime(),36).toUpperCase(); b.put("ref",ref); } else b.put("ref",old.ref);
    boolean changed=old!=null&&!status.equals(before);
    if(student&&changed&&!List.of("cancelled","cancel_requested").contains(status)) throw err(HttpStatus.FORBIDDEN,"Only the professor can do that");
    if(prof&&changed&&!List.of("confirmed","declined","rescheduled","cancelled").contains(status)) throw err(HttpStatus.FORBIDDEN,"Not allowed");
    RequestRec r=old!=null?old:new RequestRec(); r.id=id; r.studentId=sid; r.professorId=pid; b.put("id",id); r.ref=b.path("ref").asText(); r.json=b.toString(); requests.save(r);
  }
  @DeleteMapping("/requests/{id}") public void deleteRequest(Authentication au,@PathVariable String id){
    Account me=me(au); requests.findById(id).ifPresent(r->{
      if(me.role.equals("admin")||me.id.equals(r.studentId)||me.id.equals(r.professorId)) requests.delete(r); else throw err(HttpStatus.FORBIDDEN,"Not allowed"); });
  }
  @DeleteMapping("/users/me") @Transactional public void deleteMe(Authentication au){ Account a=me(au); requests.deleteByStudentIdOrProfessorId(a.id,a.id); accounts.delete(a); }
  @DeleteMapping("/users/{id}") @Transactional public void deleteUser(Authentication au,@PathVariable String id){
    if(!me(au).role.equals("admin")) throw err(HttpStatus.FORBIDDEN,"Admins only");
    requests.deleteByStudentIdOrProfessorId(id,id); accounts.deleteById(id);
  }
}
