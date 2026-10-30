package com.classedge.controller;
import com.classedge.dto.*;
import com.classedge.service.SchoolAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/school") @RequiredArgsConstructor
public class SchoolAdminController {
    private final SchoolAdminService schoolAdminService;
    @GetMapping("/students") public List<java.util.Map<String, Object>> students(Authentication auth) { return schoolAdminService.students(auth.getName()); }
    @GetMapping("/leave-requests") public List<LeaveRequestResponse> leaveRequests(Authentication auth) { return schoolAdminService.leaveRequests(auth.getName()); }
    @PostMapping("/leave-requests") public LeaveRequestResponse createLeave(Authentication auth, @RequestBody LeaveRequestInput input) { return schoolAdminService.createLeave(auth.getName(), input); }
    @PatchMapping("/leave-requests/{id}") public LeaveRequestResponse reviewLeave(Authentication auth, @PathVariable Long id, @RequestBody StatusRequest request) { return schoolAdminService.reviewLeave(auth.getName(), id, request.status()); }
    @GetMapping("/fees") public List<FeeResponse> fees(Authentication auth) { return schoolAdminService.fees(auth.getName()); }
    @PostMapping("/fees") public FeeResponse createFee(Authentication auth, @RequestBody FeeInput input) { return schoolAdminService.createFee(auth.getName(), input); }
    @PatchMapping("/fees/{id}/paid") public FeeResponse markPaid(Authentication auth, @PathVariable Long id) { return schoolAdminService.markPaid(auth.getName(), id); }
    public record StatusRequest(String status) { }
}
