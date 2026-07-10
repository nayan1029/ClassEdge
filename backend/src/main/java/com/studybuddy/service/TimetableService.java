package com.studybuddy.service;

import com.studybuddy.dto.TimetableEntryResponse;
import com.studybuddy.dto.TimetableRequest;
import com.studybuddy.entity.TimetableEntry;
import com.studybuddy.entity.User;
import com.studybuddy.exception.ApiException;
import com.studybuddy.repository.TimetableEntryRepository;
import com.studybuddy.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TimetableService {

    private static final List<String> DAYS = List.of("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday");
    private static final List<String> DEFAULT_SUBJECTS = List.of("Algorithms", "Database Systems", "Operating Systems", "Placement Prep");

    private final TimetableEntryRepository timetableEntryRepository;
    private final UserRepository userRepository;

    public List<TimetableEntryResponse> getSaved(String email) {
        User user = findUser(email);
        return timetableEntryRepository.findAllByUserOrderBySortOrderAsc(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public List<TimetableEntryResponse> generate(String email, TimetableRequest request) {
        User user = findUser(email);

        List<String> subjects = splitCsv(request.getSubjects());
        List<String> weakSubjects = splitCsv(request.getWeakSubjects());
        if (subjects.isEmpty()) {
            subjects = DEFAULT_SUBJECTS;
        }

        int dailyHours = request.getDailyHours() == null ? 2 : Math.max(1, Math.min(8, request.getDailyHours()));

        List<TimetableEntry> entries = new ArrayList<>();
        int slotCount = Math.min(DAYS.size(), subjects.size() + weakSubjects.size());
        // Guarantee every day has a slot even if fewer subjects were supplied than days.
        slotCount = Math.max(slotCount, Math.min(DAYS.size(), Math.max(subjects.size(), 1)));

        for (int index = 0; index < slotCount; index++) {
            String subject = index < weakSubjects.size()
                    ? weakSubjects.get(index)
                    : subjects.get(index % subjects.size());
            int startHour = 8 + (index % 5) * 2;
            boolean isWeak = weakSubjects.contains(subject);

            entries.add(TimetableEntry.builder()
                    .day(DAYS.get(index))
                    .subject(subject)
                    .timeSlot(String.format("%02d:00 - %02d:00", startHour, startHour + dailyHours))
                    .focus(isWeak ? "High priority revision" : "Practice and recall")
                    .sortOrder(index)
                    .user(user)
                    .build());
        }

        timetableEntryRepository.deleteAllByUser(user);
        List<TimetableEntry> saved = timetableEntryRepository.saveAll(entries);

        return saved.stream().map(this::toResponse).toList();
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));
    }

    private List<String> splitCsv(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        return Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(item -> !item.isBlank())
                .distinct()
                .collect(Collectors.toList());
    }

    private TimetableEntryResponse toResponse(TimetableEntry entry) {
        return TimetableEntryResponse.builder()
                .id(entry.getId())
                .day(entry.getDay())
                .subject(entry.getSubject())
                .time(entry.getTimeSlot())
                .focus(entry.getFocus())
                .build();
    }
}
