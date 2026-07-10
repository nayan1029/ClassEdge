package com.studybuddy.controller;

import com.studybuddy.dto.NoteRequest;
import com.studybuddy.dto.NoteResponse;
import com.studybuddy.service.NoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;

    @PostMapping
    public NoteResponse create(Authentication auth, @Valid @RequestBody NoteRequest request) {
        return noteService.create(auth.getName(), request);
    }

    @GetMapping
    public List<NoteResponse> getAll(Authentication auth) {
        return noteService.getAll(auth.getName());
    }
}
