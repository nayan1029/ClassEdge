package com.classedge.controller;

import com.classedge.dto.LearningModuleResponse;
import com.classedge.service.LibraryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/library/modules")
@RequiredArgsConstructor
public class LibraryController {
    private final LibraryService libraryService;

    @GetMapping
    public List<LearningModuleResponse> list() { return libraryService.list(); }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public LearningModuleResponse upload(Authentication auth,
            @RequestParam String title,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String description,
            @RequestParam MultipartFile file) {
        return libraryService.upload(auth.getName(), title, subject, description, file);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> download(@PathVariable Long id) {
        var module = libraryService.get(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(module.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" +
                        java.net.URLEncoder.encode(module.getFileName(), StandardCharsets.UTF_8).replace("+", "%20"))
                .body(module.getFileData());
    }

    @DeleteMapping("/{id}")
    public void delete(Authentication auth, @PathVariable Long id) {
        libraryService.delete(auth.getName(), id);
    }
}
