package com.example.placement_test_system.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "leaderboard_entry", indexes = {
    @Index(name = "idx_assessment_student", columnList = "assessmentId, studentEmail")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long assessmentId;
    private String studentEmail;
    private String studentName;
    private int totalPoints;
    private int attempts;
    private LocalDateTime finishTime;
}
