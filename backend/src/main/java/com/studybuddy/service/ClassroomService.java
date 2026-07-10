package com.studybuddy.service;

import com.studybuddy.dto.ClassroomResponse;
import com.studybuddy.dto.CreateClassroomRequest;
import com.studybuddy.dto.RosterMemberResponse;
import com.studybuddy.entity.*;
import com.studybuddy.exception.ApiException;
import com.studybuddy.repository.ClassroomMembershipRepository;
import com.studybuddy.repository.ClassroomRepository;
import com.studybuddy.repository.StudyRoomRepository;
import com.studybuddy.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClassroomService {

    private static final String CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O/0/I/1 — avoids ambiguous codes
    private static final int CODE_LENGTH = 6;
    private final SecureRandom random = new SecureRandom();

    private final ClassroomRepository classroomRepository;
    private final ClassroomMembershipRepository membershipRepository;
    private final StudyRoomRepository studyRoomRepository;
    private final UserRepository userRepository;

    @Transactional
    public ClassroomResponse createClassroom(String teacherEmail, CreateClassroomRequest request) {
        User teacher = findUser(teacherEmail);
        requireRole(teacher, Role.TEACHER, "Only teachers can create a class");

        Classroom classroom = Classroom.builder()
                .name(request.getName().trim())
                .subject(blankToNull(request.getSubject()))
                .section(blankToNull(request.getSection()))
                .description(blankToNull(request.getDescription()))
                .classCode(generateUniqueCode())
                .teacher(teacher)
                .createdAt(LocalDateTime.now())
                .build();

        classroom = classroomRepository.save(classroom);

        // Auto-provision the class's Meet/Chat space, reusing the same real-time
        // chat + WebRTC video infrastructure as standalone Study Rooms.
        StudyRoom room = StudyRoom.builder()
                .name(classroom.getName() + " — Meet")
                .topic(classroom.getSubject())
                .status(RoomStatus.LIVE)
                .createdBy(teacher)
                .classroomId(classroom.getId())
                .createdAt(LocalDateTime.now())
                .build();
        studyRoomRepository.save(room);

        return toResponse(classroom, teacher);
    }

    @Transactional
    public ClassroomResponse joinClassroom(String studentEmail, String classCode) {
        User student = findUser(studentEmail);
        requireRole(student, Role.STUDENT, "Only students can join a class with a code");

        Classroom classroom = classroomRepository.findByClassCode(normalizeCode(classCode))
                .orElseThrow(() -> new ApiException("No class found with that code"));

        if (!membershipRepository.existsByClassroomAndStudent(classroom, student)) {
            membershipRepository.save(ClassroomMembership.builder()
                    .classroom(classroom)
                    .student(student)
                    .joinedAt(LocalDateTime.now())
                    .build());
        }

        return toResponse(classroom, student);
    }

    public List<ClassroomResponse> listMyClassrooms(String email) {
        User user = findUser(email);
        List<ClassroomResponse> results = new ArrayList<>();

        if (user.getRole() == Role.TEACHER) {
            classroomRepository.findAllByTeacherOrderByCreatedAtDesc(user)
                    .forEach(classroom -> results.add(toResponse(classroom, user)));
        } else {
            membershipRepository.findAllByStudentOrderByJoinedAtDesc(user)
                    .forEach(membership -> results.add(toResponse(membership.getClassroom(), user)));
        }

        return results;
    }

    public ClassroomResponse getClassroom(String email, Long classroomId) {
        User user = findUser(email);
        Classroom classroom = findClassroom(classroomId);
        verifyMembership(classroom, user);
        return toResponse(classroom, user);
    }

    public List<RosterMemberResponse> getRoster(String email, Long classroomId) {
        User user = findUser(email);
        Classroom classroom = findClassroom(classroomId);
        verifyMembership(classroom, user);

        List<RosterMemberResponse> roster = new ArrayList<>();
        roster.add(RosterMemberResponse.builder()
                .userId(classroom.getTeacher().getId())
                .name(classroom.getTeacher().getName())
                .email(classroom.getTeacher().getEmail())
                .role("TEACHER")
                .build());

        membershipRepository.findAllByClassroomOrderByJoinedAtAsc(classroom).forEach(membership ->
                roster.add(RosterMemberResponse.builder()
                        .userId(membership.getStudent().getId())
                        .name(membership.getStudent().getName())
                        .email(membership.getStudent().getEmail())
                        .role("STUDENT")
                        .build())
        );

        return roster;
    }

    // --- shared helpers used by AnnouncementService/AssignmentService/SubmissionService too ---

    public Classroom findClassroom(Long classroomId) {
        return classroomRepository.findById(classroomId)
                .orElseThrow(() -> new ApiException("Class not found"));
    }

    public User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));
    }

    public void verifyMembership(Classroom classroom, User user) {
        boolean isTeacher = classroom.getTeacher().getId().equals(user.getId());
        boolean isEnrolled = membershipRepository.existsByClassroomAndStudent(classroom, user);
        if (!isTeacher && !isEnrolled) {
            throw new ApiException("You are not a member of this class");
        }
    }

    public void requireTeacherOfClass(Classroom classroom, User user) {
        if (!classroom.getTeacher().getId().equals(user.getId())) {
            throw new ApiException("Only this class's teacher can do that");
        }
    }

    public long studentCount(Classroom classroom) {
        return membershipRepository.countByClassroom(classroom);
    }

    // --- internal ---

    private void requireRole(User user, Role required, String message) {
        if (user.getRole() != required) {
            throw new ApiException(message);
        }
    }

    private ClassroomResponse toResponse(Classroom classroom, User currentUser) {
        boolean isTeacher = classroom.getTeacher().getId().equals(currentUser.getId());
        Long roomId = studyRoomRepository.findByClassroomId(classroom.getId())
                .map(StudyRoom::getId)
                .orElse(null);

        return ClassroomResponse.builder()
                .id(classroom.getId())
                .name(classroom.getName())
                .subject(classroom.getSubject())
                .section(classroom.getSection())
                .description(classroom.getDescription())
                .classCode(classroom.getClassCode())
                .teacherName(classroom.getTeacher().getName())
                .memberCount(studentCount(classroom))
                .myRole(isTeacher ? "TEACHER" : "STUDENT")
                .roomId(roomId)
                .build();
    }

    private String generateUniqueCode() {
        String code;
        do {
            StringBuilder builder = new StringBuilder(CODE_LENGTH);
            for (int i = 0; i < CODE_LENGTH; i++) {
                builder.append(CODE_ALPHABET.charAt(random.nextInt(CODE_ALPHABET.length())));
            }
            code = builder.toString();
        } while (classroomRepository.existsByClassCode(code));
        return code;
    }

    private String normalizeCode(String code) {
        return code == null ? "" : code.trim().toUpperCase().replaceAll("\\s+", "");
    }

    private String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }
}
