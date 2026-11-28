package com.catc.queue.v2.service;

import com.catc.queue.v2.dto.*;
import com.catc.queue.v2.entity.*;
import com.catc.queue.v2.exception.ApiException;
import com.catc.queue.v2.repository.AvailabilityRepository;
import com.catc.queue.v2.repository.ProfessorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class ProfessorService {
    private final ProfessorRepository professors;
    private final AvailabilityRepository availability;

    public ProfessorService(ProfessorRepository professors, AvailabilityRepository availability) {
        this.professors = professors;
        this.availability = availability;
    }
    private record ProfessorWithSlots(
        Professor professor,
        List<AvailabilitySlot> slots
) {}

    public Professor byEmail(String email) {
        return professors.findByEmailIgnoreCase(email).orElseThrow(() -> ApiException.notFound("Professor not found."));
    }

    public Professor byId(Long id) {
        return professors.findById(id).orElseThrow(() -> ApiException.notFound("Professor not found."));
    }

    private static boolean has(Set<String> values, String needle) {
    return needle == null || needle.isBlank()
            || values.stream().anyMatch(v ->
                v.toLowerCase(Locale.ROOT)
                 .contains(needle.trim().toLowerCase(Locale.ROOT)));
}
    // ---------- catalog (students + professors) ----------
    
public List<ProfessorCardDTO> catalog(String q, String department, String subject, String specialty,
                                      String courseYear, String semester, DayOfWeek day, LocalTime time) {
    return professors.findAll().stream()
            .filter(Professor::isEnabled)
            .filter(p -> q == null || q.isBlank()
                    || p.getName().toLowerCase(Locale.ROOT).contains(q.trim().toLowerCase(Locale.ROOT))
                    || has(p.getSubjects(), q))
            .filter(p -> department == null || department.isBlank()
                    || p.getDepartment().equalsIgnoreCase(department.trim()))
            .filter(p -> has(p.getSubjects(), subject))
            .filter(p -> has(p.getSpecialties(), specialty))
            .filter(p -> has(p.getCoursesHandled(), courseYear))
            .filter(p -> semester == null || semester.isBlank()
                    || semester.equalsIgnoreCase(p.getSemester()))
            .map(p -> new ProfessorWithSlots(
                    p,
                    availability.findByProfessorOrderByDayOfWeekAscStartTimeAsc(p)
            ))
            .filter(pair -> day == null || pair.slots().stream().anyMatch(a ->
                    a.getDayOfWeek() == day
                            && (time == null || (!time.isBefore(a.getStartTime())
                            && time.isBefore(a.getEndTime())))))
            .map(pair -> DtoMapper.card(pair.professor(), pair.slots()))
            .toList();
}
    public ProfessorProfileDTO profile(Long id) {
        Professor p = byId(id);
        return DtoMapper.profile(p, availability.findByProfessorOrderByDayOfWeekAscStartTimeAsc(p));
    }

    // ---------- professor self-service ----------
    public ProfessorDTO me(String email) { return DtoMapper.professor(byEmail(email)); }

    @Transactional
    public ProfessorDTO update(String email, ProfessorUpdateRequest r) {
        Professor p = byEmail(email);
        if (r.name() != null && !r.name().isBlank()) p.setName(r.name().trim());
        if (r.department() != null && !r.department().isBlank()) p.setDepartment(r.department().trim());
        if (r.about() != null) p.setAbout(r.about());
        if (r.contacts() != null) p.setContacts(r.contacts());
        if (r.semester() != null) p.setSemester(r.semester());
        if (r.profilePic() != null) p.setProfilePic(r.profilePic());
        if (r.subjects() != null) { p.getSubjects().clear(); p.getSubjects().addAll(r.subjects()); }
        if (r.specialties() != null) { p.getSpecialties().clear(); p.getSpecialties().addAll(r.specialties()); }
        if (r.coursesHandled() != null) { p.getCoursesHandled().clear(); p.getCoursesHandled().addAll(r.coursesHandled()); }
        return DtoMapper.professor(p);
    }

    @Transactional
    public ProfessorDTO setStatus(String email, ProfStatus status) {
        Professor p = byEmail(email);
        p.setStatus(status);
        return DtoMapper.professor(p);
    }

    @Transactional
    public ProfessorDTO setTheme(String email, Theme theme) {
        Professor p = byEmail(email);
        p.setTheme(theme);
        return DtoMapper.professor(p);
    }

    @Transactional
    public ProfessorDTO addSubject(String email, String subject) {
        Professor p = byEmail(email);
        p.getSubjects().add(subject.trim());
        return DtoMapper.professor(p);
    }

    @Transactional
    public ProfessorDTO removeSubject(String email, String subject) {
        Professor p = byEmail(email);
        p.getSubjects().removeIf(s -> s.equalsIgnoreCase(subject.trim()));
        return DtoMapper.professor(p);
    }

    // ---------- scheduling ----------
    public List<AvailabilitySlotDTO> slots(String email) {
        return availability.findByProfessorOrderByDayOfWeekAscStartTimeAsc(byEmail(email))
                .stream().map(DtoMapper::slot).toList();
    }

    @Transactional
    public AvailabilitySlotDTO addSlot(String email, AvailabilitySlotDTO dto) {
        if (!dto.endTime().isAfter(dto.startTime()))
            throw ApiException.badRequest("endTime must be after startTime.");
        Professor p = byEmail(email);
        boolean overlaps = availability.findByProfessorOrderByDayOfWeekAscStartTimeAsc(p).stream()
                .anyMatch(a -> a.getDayOfWeek() == dto.dayOfWeek()
                        && dto.startTime().isBefore(a.getEndTime()) && dto.endTime().isAfter(a.getStartTime()));
        if (overlaps) throw ApiException.conflict("This slot overlaps an existing one.");
        AvailabilitySlot a = new AvailabilitySlot();
        a.setProfessor(p);
        a.setDayOfWeek(dto.dayOfWeek());
        a.setStartTime(dto.startTime());
        a.setEndTime(dto.endTime());
        return DtoMapper.slot(availability.save(a));
    }

    @Transactional
    public void deleteSlot(String email, Long slotId) {
        Professor p = byEmail(email);
        AvailabilitySlot a = availability.findById(slotId).orElseThrow(() -> ApiException.notFound("Slot not found."));
        if (!a.getProfessor().getId().equals(p.getId())) throw ApiException.forbidden("Not your slot.");
        availability.delete(a);
    }
}
