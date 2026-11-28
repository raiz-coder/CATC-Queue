package com.catc.queue.config;
import com.catc.queue.repository.AccountRepository;
import java.util.List;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.*;
import org.springframework.beans.factory.annotation.Qualifier;
@Configuration
public class SecurityConfig {
  @Bean PasswordEncoder encoder(){ return new BCryptPasswordEncoder(); }
  /** Login works with email, Student ID or Employee ID. The principal name is the account id. */
  @Bean UserDetailsService users(AccountRepository r){
    return i -> r.findByIdent(i.trim()).map(a -> User.withUsername(a.id).password(a.pw).roles(a.role.toUpperCase()).build())
      .orElseThrow(() -> new UsernameNotFoundException(i));
  }
  @Bean CorsConfigurationSource cors(){
    CorsConfiguration c = new CorsConfiguration();

    c.setAllowedOrigins(List.of(
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ));

    c.setAllowedMethods(List.of(
        "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
    ));

    c.setAllowedHeaders(List.of(
        "Authorization", "Content-Type"
    ));

    UrlBasedCorsConfigurationSource s =
        new UrlBasedCorsConfigurationSource();

    s.registerCorsConfiguration("/api/**", c);

    return s;
}
  @Bean SecurityFilterChain chain(HttpSecurity h, @Qualifier("cors") CorsConfigurationSource corsConfigurationSource) throws Exception {
    h.cors(cors -> cors.configurationSource(corsConfigurationSource))
     .csrf(c -> c.disable())
     .headers(x -> x.frameOptions(f -> f.disable()))
     .authorizeHttpRequests(a -> a
         .requestMatchers("/h2-console/**").permitAll()
         .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
         .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
         .anyRequest().authenticated()
     )
     .httpBasic(b -> b.authenticationEntryPoint(
         (rq, rs, e) -> rs.sendError(401)
     ));

    return h.build();
}
}
