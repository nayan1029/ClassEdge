package com.classedge.repository;
import com.classedge.entity.AttendanceRecord;
import com.classedge.entity.Classroom;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
    List<AttendanceRecord> findAllByClassroomAndAttendanceDate(Classroom classroom, LocalDate date);
    Optional<AttendanceRecord> findByClassroomAndStudentIdAndAttendanceDate(Classroom classroom, Long studentId, LocalDate date);
}
