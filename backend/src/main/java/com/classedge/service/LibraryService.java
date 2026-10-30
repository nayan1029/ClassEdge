package com.classedge.service;

import com.classedge.dto.LearningModuleResponse;
import com.classedge.entity.LearningModule;
import com.classedge.entity.Role;
import com.classedge.entity.User;
import com.classedge.exception.ApiException;
import com.classedge.repository.LearningModuleRepository;
import com.classedge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LibraryService {
    private static final long MAX_FILE_SIZE = 15 * 1024 * 1024;
    private final LearningModuleRepository moduleRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<LearningModuleResponse> list() {
        return moduleRepository.findAllByOrderByUploadedAtDesc().stream().map(this::toResponse).toList();
    }

    @Transactional
    public LearningModuleResponse upload(String email, String title, String subject, String description, MultipartFile file) {
        User teacher = userRepository.findByEmail(email).orElseThrow(() -> new ApiException("User not found"));
        requireCanManage(teacher);
        if (title == null || title.isBlank()) throw new ApiException("Module title is required");
        if (file == null || file.isEmpty()) throw new ApiException("Choose a module file to upload");
        if (file.getSize() > MAX_FILE_SIZE) throw new ApiException("Files must be 15 MB or smaller");
        try {
            LearningModule module = moduleRepository.save(LearningModule.builder()
                    .title(title.trim())
                    .subject(blankToNull(subject))
                    .description(blankToNull(description))
                    .fileName(safeFileName(file.getOriginalFilename()))
                    .contentType(file.getContentType() == null ? "application/octet-stream" : file.getContentType())
                    .fileData(file.getBytes())
                    .uploadedBy(teacher)
                    .uploadedAt(LocalDateTime.now())
                    .build());
            return toResponse(module);
        } catch (IOException exception) {
            throw new ApiException("The module file could not be read");
        }
    }

    @Transactional(readOnly = true)
    public LearningModule get(Long id) {
        return moduleRepository.findById(id).orElseThrow(() -> new ApiException("Module not found"));
    }

    @Transactional
    public void delete(String email, Long id) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ApiException("User not found"));
        LearningModule module = get(id);
        if (user.getRole() != Role.ADMIN && !module.getUploadedBy().getId().equals(user.getId())) {
            throw new ApiException("Only the uploading teacher or an admin can remove this module");
        }
        moduleRepository.delete(module);
    }

    private void requireCanManage(User user) {
        if (user.getRole() != Role.TEACHER && user.getRole() != Role.ADMIN)
            throw new ApiException("Only teachers can upload learning modules");
    }

    private LearningModuleResponse toResponse(LearningModule module) {
        return LearningModuleResponse.builder().id(module.getId()).title(module.getTitle())
                .subject(module.getSubject()).description(module.getDescription()).fileName(module.getFileName())
                .contentType(module.getContentType()).teacherName(module.getUploadedBy().getName())
                .uploadedAt(module.getUploadedAt()).build();
    }

    private String safeFileName(String value) {
        if (value == null || value.isBlank()) return "module";
        return value.replaceAll("[\\r\\n\\\\/\"]", "_");
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
