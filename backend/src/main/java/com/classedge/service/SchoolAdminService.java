package com.classedge.service;
import com.classedge.dto.*;
import com.classedge.entity.*;
import com.classedge.exception.ApiException;
import com.classedge.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service @RequiredArgsConstructor
public class SchoolAdminService {
    private final LeaveRequestRepository leaveRepository;
    private final FeeRecordRepository feeRepository;
    private final ClassroomRepository classroomRepository;
    private final ClassroomMembershipRepository membershipRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<java.util.Map<String, Object>> students(String email) {
        if (user(email).getRole() != Role.ADMIN) throw new ApiException("Only admins can view the full student directory");
        return userRepository.findAllByRoleOrderByNameAsc(Role.STUDENT).stream()
                .map(student -> java.util.Map.<String, Object>of("id", student.getId(), "name", student.getName(), "email", student.getEmail()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LeaveRequestResponse> leaveRequests(String email) {
        User caller = user(email);
        List<LeaveRequest> requests;
        if (caller.getRole() == Role.STUDENT) requests = leaveRepository.findAllByStudentOrderByCreatedAtDesc(caller);
        else if (caller.getRole() == Role.ADMIN) requests = leaveRepository.findAllByOrderByCreatedAtDesc();
        else {
            List<Long> classIds = classroomRepository.findAllByTeacherOrderByCreatedAtDesc(caller).stream().map(Classroom::getId).toList();
            requests = classIds.isEmpty() ? List.of() : leaveRepository.findAllByClassroomIdInOrderByCreatedAtDesc(classIds);
        }
        return requests.stream().map(this::leaveResponse).toList();
    }

    @Transactional
    public LeaveRequestResponse createLeave(String email, LeaveRequestInput input) {
        User student = user(email);
        if (student.getRole() != Role.STUDENT) throw new ApiException("Only students can request leave");
        if (input.getStartDate() == null || input.getEndDate() == null || input.getEndDate().isBefore(input.getStartDate())) throw new ApiException("Enter a valid leave date range");
        if (input.getReason() == null || input.getReason().isBlank()) throw new ApiException("A reason is required");
        Classroom classroom = classroomRepository.findById(input.getClassroomId()).orElseThrow(() -> new ApiException("Class not found"));
        if (!membershipRepository.existsByClassroomAndStudent(classroom, student)) throw new ApiException("You are not enrolled in this class");
        LeaveRequest saved = leaveRepository.save(LeaveRequest.builder().student(student).classroom(classroom)
                .startDate(input.getStartDate()).endDate(input.getEndDate()).reason(input.getReason().trim())
                .status("PENDING").createdAt(LocalDateTime.now()).build());
        return leaveResponse(saved);
    }

    @Transactional
    public LeaveRequestResponse reviewLeave(String email, Long id, String status) {
        User reviewer = user(email);
        if (reviewer.getRole() != Role.TEACHER && reviewer.getRole() != Role.ADMIN) throw new ApiException("Only a teacher or admin can review leave requests");
        LeaveRequest request = leaveRepository.findById(id).orElseThrow(() -> new ApiException("Leave request not found"));
        if (reviewer.getRole() == Role.TEACHER && !request.getClassroom().getTeacher().getId().equals(reviewer.getId())) throw new ApiException("You can only review requests for your own classes");
        String normalized = status == null ? "" : status.toUpperCase();
        if (!List.of("APPROVED", "REJECTED").contains(normalized)) throw new ApiException("Status must be APPROVED or REJECTED");
        request.setStatus(normalized); request.setReviewedBy(reviewer);
        return leaveResponse(request);
    }

    @Transactional(readOnly = true)
    public List<FeeResponse> fees(String email) {
        User caller = user(email);
        if (caller.getRole() == Role.ADMIN) return feeRepository.findAllByOrderByDueDateAsc().stream().map(this::feeResponse).toList();
        if (caller.getRole() != Role.STUDENT) throw new ApiException("Fees are visible to students and admins");
        return feeRepository.findAllByStudentOrderByDueDateAsc(caller).stream().map(this::feeResponse).toList();
    }

    @Transactional
    public FeeResponse createFee(String email, FeeInput input) {
        User admin = user(email);
        if (admin.getRole() != Role.ADMIN) throw new ApiException("Only admins can create fee records");
        User student = userRepository.findById(input.getStudentId()).orElseThrow(() -> new ApiException("Student not found"));
        if (student.getRole() != Role.STUDENT) throw new ApiException("Fees can only be assigned to students");
        if (input.getDescription() == null || input.getDescription().isBlank() || input.getAmount() == null || input.getAmount().signum() <= 0 || input.getDueDate() == null) throw new ApiException("Enter a description, positive amount, and due date");
        return feeResponse(feeRepository.save(FeeRecord.builder().student(student).createdBy(admin).description(input.getDescription().trim()).amount(input.getAmount()).dueDate(input.getDueDate()).status("UNPAID").createdAt(LocalDateTime.now()).build()));
    }

    @Transactional
    public FeeResponse markPaid(String email, Long id) {
        if (user(email).getRole() != Role.ADMIN) throw new ApiException("Only admins can update fee status");
        FeeRecord fee = feeRepository.findById(id).orElseThrow(() -> new ApiException("Fee record not found"));
        fee.setStatus("PAID");
        return feeResponse(fee);
    }

    private User user(String email) { return userRepository.findByEmail(email).orElseThrow(() -> new ApiException("User not found")); }
    private LeaveRequestResponse leaveResponse(LeaveRequest request) { return LeaveRequestResponse.builder().id(request.getId()).classroomId(request.getClassroom().getId()).classroomName(request.getClassroom().getName()).studentId(request.getStudent().getId()).studentName(request.getStudent().getName()).startDate(request.getStartDate()).endDate(request.getEndDate()).reason(request.getReason()).status(request.getStatus()).createdAt(request.getCreatedAt()).build(); }
    private FeeResponse feeResponse(FeeRecord fee) { return FeeResponse.builder().id(fee.getId()).studentId(fee.getStudent().getId()).studentName(fee.getStudent().getName()).description(fee.getDescription()).amount(fee.getAmount()).dueDate(fee.getDueDate()).status(fee.getStatus()).build(); }
}
