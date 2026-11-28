package com.catc.queue.v2.service;

import com.catc.queue.v2.dto.*;
import com.catc.queue.v2.entity.*;
import com.catc.queue.v2.exception.ApiException;
import com.catc.queue.v2.repository.BookingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.function.Predicate;

import static com.catc.queue.v2.entity.BookingStatus.*;

@Service
public class BookingService {
    private static final Set<BookingStatus> ACTIVE =
            EnumSet.of(PENDING, ACCEPTED, RESCHEDULE_PROPOSED, CANCEL_REQUESTED);

    private final BookingRepository bookings;
    private final StudentService studentService;
    private final ProfessorService professorService;

    public BookingService(BookingRepository bookings, StudentService studentService, ProfessorService professorService) {
        this.bookings = bookings;
        this.studentService = studentService;
        this.professorService = professorService;
    }

    // ===================== STUDENT SIDE =====================

    @Transactional
    public BookingDTO create(String studentEmail, BookingCreateRequest r) {
        Student s = studentService.byEmail(studentEmail);
        Professor p = professorService.byId(r.professorId());
        if (!p.isEnabled()) throw ApiException.badRequest("This professor is not accepting bookings.");
        if (bookings.existsByStudentAndProfessorAndSubjectIgnoreCaseAndExamDateAndExamTimeAndStatusIn(
                s, p, r.subject().trim(), r.examDate(), r.examTime(), List.copyOf(ACTIVE)))
            throw ApiException.conflict("You already have an active request for this subject, date and time.");
        if (bookings.existsByProfessorAndExamDateAndExamTimeAndStatus(p, r.examDate(), r.examTime(), ACCEPTED))
            throw ApiException.conflict("That time slot is already taken.");

        Booking b = new Booking();
        b.setStudent(s);
        b.setProfessor(p);
        b.setSubject(r.subject().trim());
        b.setExamDate(r.examDate());
        b.setExamTime(r.examTime());
        b.setMessage(r.message());
        b.setReferenceReq(s.getReferenceReq());
        return DtoMapper.booking(bookings.save(b), true);
    }

    /** view = ALL | CURRENT | REQUEST | ACCOMPLISHED | HISTORY */
    public List<BookingDTO> studentBookings(String studentEmail, String view) {
        Student s = studentService.byEmail(studentEmail);
        Predicate<Booking> filter = switch (norm(view)) {
            case "ALL" -> b -> true;
            case "CURRENT" -> b -> b.getStatus() == ACCEPTED || b.getStatus() == CANCEL_REQUESTED;
            case "REQUEST" -> b -> b.getStatus() == PENDING || b.getStatus() == RESCHEDULE_PROPOSED;
            case "ACCOMPLISHED" -> b -> b.getStatus() == COMPLETED;
            case "HISTORY" -> b -> b.getStatus() == COMPLETED || b.getStatus() == CANCELLED || b.getStatus() == DECLINED;
            default -> throw ApiException.badRequest("Unknown view: " + view);
        };
        return bookings.findByStudentOrderByExamDateDescExamTimeDesc(s).stream()
                .filter(filter).map(b -> DtoMapper.booking(b, true)).toList();
    }

    /** Not agreed yet -> cancelled at once. Already accepted -> the professor must agree. */
    @Transactional
    public BookingDTO studentCancel(String studentEmail, Long id) {
        Booking b = ownedByStudent(studentEmail, id);
        switch (b.getStatus()) {
            case PENDING, RESCHEDULE_PROPOSED -> b.setStatus(CANCELLED);
            case ACCEPTED -> b.setStatus(CANCEL_REQUESTED);
            default -> throw ApiException.badRequest("A " + b.getStatus() + " booking cannot be cancelled.");
        }
        return DtoMapper.booking(b, true);
    }

    @Transactional
    public BookingDTO studentAcceptReschedule(String studentEmail, Long id) {
        Booking b = ownedByStudent(studentEmail, id);
        if (b.getStatus() != RESCHEDULE_PROPOSED || b.getProposedDate() == null)
            throw ApiException.badRequest("No reschedule proposal to accept.");
        if (bookings.existsByProfessorAndExamDateAndExamTimeAndStatus(
                b.getProfessor(), b.getProposedDate(), b.getProposedTime(), ACCEPTED))
            throw ApiException.conflict("The proposed slot has since been taken.");
        b.setExamDate(b.getProposedDate());
        b.setExamTime(b.getProposedTime());
        b.setProposedDate(null);
        b.setProposedTime(null);
        b.setStatus(ACCEPTED);
        return DtoMapper.booking(b, true);
    }

    // ===================== PROFESSOR SIDE =====================

    /** view = ALL | PENDING | TODAY | UPCOMING | CURRENT | ACCOMPLISHED | HISTORY */
    public List<BookingDTO> professorBookings(String profEmail, String view) {
        Professor p = professorService.byEmail(profEmail);
        LocalDate today = LocalDate.now();
        Predicate<Booking> filter = switch (norm(view)) {
            case "ALL" -> b -> true;
            case "PENDING" -> b -> b.getStatus() == PENDING;
            case "TODAY" -> b -> b.getExamDate().equals(today) && ACTIVE.contains(b.getStatus());
            case "UPCOMING" -> b -> b.getExamDate().isAfter(today) && ACTIVE.contains(b.getStatus());
            case "CURRENT" -> b -> b.getStatus() == ACCEPTED || b.getStatus() == CANCEL_REQUESTED;
            case "ACCOMPLISHED" -> b -> b.getStatus() == COMPLETED;
            case "HISTORY" -> b -> b.getStatus() == COMPLETED || b.getStatus() == CANCELLED || b.getStatus() == DECLINED;
            default -> throw ApiException.badRequest("Unknown view: " + view);
        };
        return bookings.findByProfessorOrderByExamDateDescExamTimeDesc(p).stream()
                .filter(filter).map(b -> DtoMapper.booking(b, false)).toList();
    }

    public List<BookingDTO> calendar(String profEmail, LocalDate from, LocalDate to) {
        if (to.isBefore(from)) throw ApiException.badRequest("'to' must not be before 'from'.");
        Professor p = professorService.byEmail(profEmail);
        return bookings.findByProfessorAndExamDateBetweenOrderByExamDateAscExamTimeAsc(p, from, to).stream()
                .filter(b -> ACTIVE.contains(b.getStatus()) || b.getStatus() == COMPLETED)
                .map(b -> DtoMapper.booking(b, false)).toList();
    }

    /** The professor re-types the student's details; reference must be exactly identical. */
    @Transactional
    public BookingDTO accept(String profEmail, Long id, ConfirmBookingRequest r) {
        Booking b = ownedByProfessor(profEmail, id);
        if (b.getStatus() != PENDING) throw ApiException.badRequest("Only PENDING requests can be accepted.");
        Student s = b.getStudent();
        if (!b.getReferenceReq().equals(r.referenceReq()))
            throw ApiException.badRequest("Reference request does not match the student's record.");
        if (!b.getSubject().equalsIgnoreCase(r.subject().trim())
                || !b.getExamDate().equals(r.examDate()) || !b.getExamTime().equals(r.examTime())
                || !s.getFullName().equalsIgnoreCase(r.studentName().trim())
                || !s.getStudentId().equals(r.studentId().trim()))
            throw ApiException.badRequest("Subject, date, time, student name and student ID must match the request.");
        if (bookings.existsByProfessorAndExamDateAndExamTimeAndStatus(b.getProfessor(), b.getExamDate(), b.getExamTime(), ACCEPTED))
            throw ApiException.conflict("You already accepted another booking at that time.");
        b.setStatus(ACCEPTED);
        return DtoMapper.booking(b, false);
    }

    /** reschedule=true ("Yes") proposes a new slot; reschedule=false ("Quit") declines outright. */
    @Transactional
    public BookingDTO decline(String profEmail, Long id, DeclineRequest r) {
        Booking b = ownedByProfessor(profEmail, id);
        if (b.getStatus() != PENDING) throw ApiException.badRequest("Only PENDING requests can be declined.");
        b.setProfessorNote(r.note());
        if (r.reschedule()) {
            if (r.proposedDate() == null || r.proposedTime() == null)
                throw ApiException.badRequest("proposedDate and proposedTime are required to reschedule.");
            if (r.proposedDate().isBefore(LocalDate.now()))
                throw ApiException.badRequest("proposedDate cannot be in the past.");
            b.setProposedDate(r.proposedDate());
            b.setProposedTime(r.proposedTime());
            b.setStatus(RESCHEDULE_PROPOSED);
        } else {
            b.setStatus(DECLINED);
        }
        return DtoMapper.booking(b, false);
    }

    @Transactional
    public BookingDTO approveCancel(String profEmail, Long id) {
        Booking b = ownedByProfessor(profEmail, id);
        if (b.getStatus() != CANCEL_REQUESTED) throw ApiException.badRequest("No cancellation was requested.");
        b.setStatus(CANCELLED);
        return DtoMapper.booking(b, false);
    }

    @Transactional
    public BookingDTO rejectCancel(String profEmail, Long id) {
        Booking b = ownedByProfessor(profEmail, id);
        if (b.getStatus() != CANCEL_REQUESTED) throw ApiException.badRequest("No cancellation was requested.");
        b.setStatus(ACCEPTED);
        return DtoMapper.booking(b, false);
    }

    @Transactional
    public BookingDTO complete(String profEmail, Long id) {
        Booking b = ownedByProfessor(profEmail, id);
        if (b.getStatus() != ACCEPTED) throw ApiException.badRequest("Only ACCEPTED bookings can be completed.");
        b.setStatus(COMPLETED);
        return DtoMapper.booking(b, false);
    }

    // ===================== ADMIN SIDE =====================

    public List<BookingDTO> all() {
        return bookings.findAll().stream().map(b -> DtoMapper.booking(b, false)).toList();
    }

    @Transactional
    public void adminDelete(Long id) {
        if (!bookings.existsById(id)) throw ApiException.notFound("Booking not found.");
        bookings.deleteById(id);
    }

    // ===================== helpers =====================

    private static String norm(String view) { return view == null ? "ALL" : view.trim().toUpperCase(); }

    private Booking find(Long id) {
        return bookings.findById(id).orElseThrow(() -> ApiException.notFound("Booking not found."));
    }

    private Booking ownedByStudent(String email, Long id) {
        Booking b = find(id);
        if (!b.getStudent().getEmail().equalsIgnoreCase(email)) throw ApiException.forbidden("Not your booking.");
        return b;
    }

    private Booking ownedByProfessor(String email, Long id) {
        Booking b = find(id);
        if (!b.getProfessor().getEmail().equalsIgnoreCase(email)) throw ApiException.forbidden("Not your booking.");
        return b;
    }
}
