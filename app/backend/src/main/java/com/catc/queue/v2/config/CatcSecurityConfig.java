package com.catc.queue.v2.config;

import com.catc.queue.v2.repository.*;
import com.catc.queue.v2.service.PasswordHasher;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;

/**
 * A separate filter chain that only matches /api/v2/**, evaluated first.
 * Your existing SecurityFilterChain keeps handling everything else, untouched.
 */
@Configuration
public class CatcSecurityConfig {

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public SecurityFilterChain catcV2Chain(HttpSecurity http, StudentRepository students,
                                           ProfessorRepository professors, AdminRepository admins,
                                           PasswordHasher hasher) throws Exception {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(new CatcUserDetailsService(students, professors, admins));
        provider.setPasswordEncoder(hasher.encoder());

        http.securityMatcher("/api/v2/**")
            .authenticationProvider(provider)
            .csrf(csrf -> csrf.disable())                       // stateless Basic-auth API
            .cors(c -> c.configurationSource(req -> {
                CorsConfiguration cfg = new CorsConfiguration();
                cfg.setAllowedOriginPatterns(List.of("*"));     // tighten to your Netlify URL in production
                cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
                cfg.setAllowedHeaders(List.of("*"));
                return cfg;
            }))
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v2/auth/register/**").permitAll()
                .requestMatchers("/api/v2/student/**").hasRole("STUDENT")
                .requestMatchers("/api/v2/professor/**").hasRole("PROFESSOR")
                .requestMatchers("/api/v2/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            .httpBasic(Customizer.withDefaults());
        return http.build();
    }
}
