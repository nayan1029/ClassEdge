package com.studybuddy.controller;

import com.studybuddy.dto.TimetableEntryResponse;
import com.studybuddy.dto.TimetableRequest;
import com.studybuddy.service.TimetableService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/timetable")
@RequiredArgsConstructor
public class TimetableController {

    private final TimetableService timetableService;

    @GetMapping
    public List<TimetableEntryResponse> getTimetable(Authentication auth) {
        return timetableService.getSaved(auth.getName());
    }

    @PostMapping("/generate")
    public List<TimetableEntryResponse> generate(Authentication auth, @RequestBody TimetableRequest request) {
        return timetableService.generate(auth.getName(), request);
    }
}
