package com.classedge.dto;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.util.List;
@Getter @Setter
public class AttendanceRequest {
    private LocalDate date;
    private List<Entry> entries;
    @Getter @Setter public static class Entry { private Long studentId; private String status; }
}
