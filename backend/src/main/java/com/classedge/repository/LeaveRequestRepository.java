package com.classedge.repository;
import com.classedge.entity.LeaveRequest;
import com.classedge.entity.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findAllByStudentOrderByCreatedAtDesc(User student);
    List<LeaveRequest> findAllByClassroomIdInOrderByCreatedAtDesc(List<Long> classroomIds);
    List<LeaveRequest> findAllByOrderByCreatedAtDesc();
}
