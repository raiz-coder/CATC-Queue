package com.catc.queue.v2.config;

import com.catc.queue.v2.repository.*;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;

import java.util.List;

/** Looks the e-mail up in students, then professors, then admins. Not a bean on purpose (see SecurityConfig). */
public class CatcUserDetailsService implements UserDetailsService {
    private final StudentRepository students;
    private final ProfessorRepository professors;
    private final AdminRepository admins;

    public CatcUserDetailsService(StudentRepository students, ProfessorRepository professors, AdminRepository admins) {
        this.students = students;
        this.professors = professors;
        this.admins = admins;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        var s = students.findByEmailIgnoreCase(email);
        if (s.isPresent()) return build(s.get().getEmail(), s.get().getPassword(), "STUDENT", s.get().isEnabled());
        var p = professors.findByEmailIgnoreCase(email);
        if (p.isPresent()) return build(p.get().getEmail(), p.get().getPassword(), "PROFESSOR", p.get().isEnabled());
        var a = admins.findByEmailIgnoreCase(email);
        if (a.isPresent()) return build(a.get().getEmail(), a.get().getPassword(), "ADMIN", a.get().isEnabled());
        throw new UsernameNotFoundException("No account for " + email);
    }

    private static UserDetails build(String email, String hash, String role, boolean enabled) {
        return User.withUsername(email).password(hash).disabled(!enabled)
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + role))).build();
    }
}
