package com.catc.queue.v2.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "catc_students")
@Getter @Setter @NoArgsConstructor
public class Student {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 40)
    private String studentId;

    @Column(nullable = false) private String fullName;
    @Column(nullable = false, unique = true) private String email;
    @Column(nullable = false) private String courseYear;
    @Column(nullable = false, unique = true) private String referenceReq;

    @Lob @Column(columnDefinition = "TEXT") private String profilePic; // URL or base64 data URI
    @Column(nullable = false) private String password;                  // BCrypt hash
    @Column(nullable = false) private String role = "STUDENT";

    @Column(length = 2000) private String about;
    private LocalDate birthday;
    @Column(length = 500) private String contacts;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "catc_student_interests", joinColumns = @JoinColumn(name = "student_pk"))
    private Set<String> interestedSubjects = new LinkedHashSet<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "catc_student_accomplishments", joinColumns = @JoinColumn(name = "student_pk"))
    private Set<String> accomplishments = new LinkedHashSet<>();

    @Enumerated(EnumType.STRING) private Theme theme = Theme.DEFAULT;
    private boolean enabled = true;
}
