package com.catc.queue.v2.dto;

import com.catc.queue.v2.entity.*;
import java.util.List;
import java.util.Set;

public final class DtoMapper {
    private DtoMapper() { }

    public static StudentDTO student(Student s) {
        return new StudentDTO(s.getId(), s.getStudentId(), s.getFullName(), s.getEmail(), s.getCourseYear(),
                s.getReferenceReq(), s.getProfilePic(), s.getAbout(), s.getBirthday(),
                Set.copyOf(s.getInterestedSubjects()), Set.copyOf(s.getAccomplishments()),
                s.getContacts(), s.getTheme());
    }

    public static StudentProfileDTO studentProfile(Student s) {
        return new StudentProfileDTO(s.getId(), s.getStudentId(), s.getFullName(), s.getEmail(), s.getCourseYear(),
                s.getProfilePic(), s.getAbout(), s.getBirthday(),
                Set.copyOf(s.getInterestedSubjects()), Set.copyOf(s.getAccomplishments()), s.getContacts());
    }

    public static ProfessorDTO professor(Professor p) {
        return new ProfessorDTO(p.getId(), p.getEmployeeId(), p.getName(), p.getEmail(), p.getReference(),
                p.getDepartment(), p.getProfilePic(), p.getAbout(), p.getContacts(), p.getStatus(),
                p.getSemester(), Set.copyOf(p.getSubjects()), Set.copyOf(p.getSpecialties()),
                Set.copyOf(p.getCoursesHandled()), p.getTheme());
    }

    public static ProfessorCardDTO card(Professor p, List<AvailabilitySlot> slots) {
        List<String> schedule = slots.stream()
                .map(a -> a.getDayOfWeek() + " " + a.getStartTime() + "-" + a.getEndTime()).toList();
        return new ProfessorCardDTO(p.getId(), p.getName(), p.getDepartment(), p.getProfilePic(),
                p.getStatus(), schedule, Set.copyOf(p.getSubjects()));
    }

    public static ProfessorProfileDTO profile(Professor p, List<AvailabilitySlot> slots) {
        return new ProfessorProfileDTO(p.getId(), p.getName(), p.getEmail(), p.getDepartment(), p.getProfilePic(),
                p.getAbout(), p.getContacts(), p.getStatus(), p.getSemester(),
                Set.copyOf(p.getSubjects()), Set.copyOf(p.getSpecialties()), Set.copyOf(p.getCoursesHandled()),
                slots.stream().map(DtoMapper::slot).toList());
    }

    public static AvailabilitySlotDTO slot(AvailabilitySlot a) {
        return new AvailabilitySlotDTO(a.getId(), a.getDayOfWeek(), a.getStartTime(), a.getEndTime());
    }

    /** revealReference=false for professor/admin-facing lists: the professor must type the reference to confirm. */
    public static BookingDTO booking(Booking b, boolean revealReference) {
        Student s = b.getStudent();
        Professor p = b.getProfessor();
        return new BookingDTO(b.getId(), b.getStatus(), b.getSubject(), b.getExamDate(), b.getExamTime(),
                b.getMessage(), revealReference ? b.getReferenceReq() : null,
                s.getId(), s.getStudentId(), s.getFullName(), s.getCourseYear(),
                p.getId(), p.getName(), p.getDepartment(),
                b.getProposedDate(), b.getProposedTime(), b.getProfessorNote(), b.getCreatedAt());
    }
}
