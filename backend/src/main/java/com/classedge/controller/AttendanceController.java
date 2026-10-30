package com.classedge.controller;
import com.classedge.dto.AttendanceRequest;
import com.classedge.dto.AttendanceResponse;
import com.classedge.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
@RestController @RequestMapping("/api/classrooms/{classroomId}/attendance") @RequiredArgsConstructor
public class AttendanceController {
    private final AttendanceService attendanceService;
    @GetMapping public List<AttendanceResponse> list(Authentication auth, @PathVariable Long classroomId, @RequestParam(required = false) LocalDate date) {
        return attendanceService.list(auth.getName(), classroomId, date == null ? LocalDate.now() : date);
    }
    @PutMapping public List<AttendanceResponse> mark(Authentication auth, @PathVariable Long classroomId, @RequestBody AttendanceRequest request) {
        return attendanceService.mark(auth.getName(), classroomId, request);
    }
}
