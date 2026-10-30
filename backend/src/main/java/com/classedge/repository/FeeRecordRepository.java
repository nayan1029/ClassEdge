package com.classedge.repository;
import com.classedge.entity.FeeRecord;
import com.classedge.entity.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
public interface FeeRecordRepository extends JpaRepository<FeeRecord, Long> {
    List<FeeRecord> findAllByStudentOrderByDueDateAsc(User student);
    List<FeeRecord> findAllByOrderByDueDateAsc();
}
