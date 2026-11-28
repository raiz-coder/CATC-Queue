package com.catc.queue.v2.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "catc_bookings")
@Getter @Setter @NoArgsConstructor
public class Booking {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.EAGER) private Student student;
    @ManyToOne(optional = false, fetch = FetchType.EAGER) private Professor professor;

    @Column(nullable = false) private String subject;
    @Column(nullable = false) private LocalDate examDate;
    @Column(nullable = false) private LocalTime examTime;
    @Column(length = 1000) private String message;
    @Column(nullable = false) private String referenceReq; // copied from the student's record

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private BookingStatus status = BookingStatus.PENDING;

    private LocalDate proposedDate;
    private LocalTime proposedTime;
    @Column(length = 500) private String professorNote;
    @Column(nullable = false) private Instant createdAt = Instant.now();
}
