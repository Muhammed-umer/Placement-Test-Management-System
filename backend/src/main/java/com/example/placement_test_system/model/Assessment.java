package com.example.placement_test_system.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Assessment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;

    @Enumerated(EnumType.STRING)
    private AssessmentType type;

    private int totalPoints;
    private int durationMinutes;
    private String batch; // Target specific student groups
    @Column(columnDefinition = "integer default 1")
    private int maxAttempts = 1; // New feature: restrict maximum number of test attempts

    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String url;

    @ElementCollection
    private List<String> allowedLanguages;

    @OneToMany(cascade = CascadeType.ALL)
    private List<Question> questions;
}