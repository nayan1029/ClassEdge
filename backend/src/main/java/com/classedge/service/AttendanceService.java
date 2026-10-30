package com.classedge.service;
import com.classedge.dto.AttendanceRequest;
import com.classedge.dto.AttendanceResponse;
import com.classedge.entity.*;
import com.classedge.exception.ApiException;
import com.classedge.repository.AttendanceRecordRepository;
import com.classedge.repository.ClassroomMembershipRepository;
import com.classedge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service @RequiredArgsConstructor
public class AttendanceService {
    private final AttendanceRecordRepository records;
    private final ClassroomService classroomService;
    private final ClassroomMembershipRepository memberships;
    private final UserRepository users;

    @Transactional(readOnly = true)
    public List<AttendanceResponse> list(String email, Long classroomId, LocalDate date) {
        User caller = classroomService.findUser(email);
        Classroom classroom = classroomService.findClassroom(classroomId);
        classroomService.verifyMembership(classroom, caller);
        List<AttendanceRecord> result = records.findAllByClassroomAndAttendanceDate(classroom, date);
        if (caller.getRole() == Role.STUDENT) result = result.stream().filter(row -> row.getStudent().getId().equals(caller.getId())).toList();
        return result.stream().map(this::toResponse).toList();
    }

    @Transactional
    public List<AttendanceResponse> mark(String email, Long classroomId, AttendanceRequest request) {
        User teacher = classroomService.findUser(email);
        Classroom classroom = classroomService.findClassroom(classroomId);
        classroomService.requireTeacherOfClass(classroom, teacher);
        LocalDate date = request.getDate() == null ? LocalDate.now() : request.getDate();
        if (request.getEntries() == null || request.getEntries().isEmpty()) throw new ApiException("Choose attendance statuses before saving");
        for (AttendanceRequest.Entry entry : request.getEntries()) {
            User student = users.findById(entry.getStudentId()).orElseThrow(() -> new ApiException("Student not found"));
            if (student.getRole() != Role.STUDENT || !memberships.existsByClassroomAndStudent(classroom, student)) throw new ApiException("Student is not enrolled in this class");
            String status = entry.getStatus() == null ? "" : entry.getStatus().toUpperCase();
            if (!List.of("PRESENT", "ABSENT", "LATE", "EXCUSED").contains(status)) throw new ApiException("Invalid attendance status");
            AttendanceRecord row = records.findByClassroomAndStudentIdAndAttendanceDate(classroom, student.getId(), date)
                    .orElseGet(AttendanceRecord::new);
            row.setClassroom(classroom); row.setStudent(student); row.setMarkedBy(teacher); row.setAttendanceDate(date); row.setStatus(status);
            records.save(row);
        }
        return list(email, classroomId, date);
    }

    private AttendanceResponse toResponse(AttendanceRecord row) {
        return AttendanceResponse.builder().studentId(row.getStudent().getId()).studentName(row.getStudent().getName()).date(row.getAttendanceDate()).status(row.getStatus()).build();
    }
}
