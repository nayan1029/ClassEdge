package com.studybuddy.repository;

import com.studybuddy.entity.TimetableEntry;
import com.studybuddy.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TimetableEntryRepository extends JpaRepository<TimetableEntry, Long> {
    List<TimetableEntry> findAllByUserOrderBySortOrderAsc(User user);

    void deleteAllByUser(User user);
}
