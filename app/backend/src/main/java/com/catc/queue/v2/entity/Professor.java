package com.catc.queue.v2.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "catc_professors")
@Getter @Setter @NoArgsConstructor
public class Professor {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 40) private String employeeId;
    @Column(nullable = false) private String name;
    @Column(nullable = false, unique = true) private String email;
    @Column(nullable = false) private String reference;
    @Column(nullable = false) private String department;

    @Lob @Column(columnDefinition = "TEXT") private String profilePic;
    @Column(nullable = false) private String password; // BCrypt hash
    @Column(nullable = false) private String role = "PROFESSOR";

    @Column(length = 2000) private String about;
    @Column(length = 500) private String contacts;
    private String semester;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "catc_prof_subjects", joinColumns = @JoinColumn(name = "professor_pk"))
    private Set<String> subjects = new LinkedHashSet<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "catc_prof_specialties", joinColumns = @JoinColumn(name = "professor_pk"))
    private Set<String> specialties = new LinkedHashSet<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "catc_prof_courses", joinColumns = @JoinColumn(name = "professor_pk"))
    private Set<String> coursesHandled = new LinkedHashSet<>(); // e.g. "BSIT-3"

    @Enumerated(EnumType.STRING) private ProfStatus status = ProfStatus.RED;
    @Enumerated(EnumType.STRING) private Theme theme = Theme.DEFAULT;
    private boolean enabled = true;
}
