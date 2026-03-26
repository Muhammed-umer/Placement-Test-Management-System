package com.example.placement_test_system.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "contest_problems", indexes = {
    @Index(name = "idx_topic_difficulty", columnList = "topic,difficulty"),
    @Index(name = "idx_content_hash", columnList = "content_hash"),
    @Index(name = "idx_created_date", columnList = "created_date"),
    @Index(name = "idx_problem_type", columnList = "problem_type")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContestProblem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProblemType problemType;
    @ Column(nullable = false)
    private String topic;
    @Column(nullable = false)
    private String difficulty;
    private String title;
    @Column(columnDefinition = "TEXT")
    private String description;
    @ElementCollection
    private List<String> options;
    private String correctAnswer;
    @Column(columnDefinition = "TEXT")
    private String inputFormat;
    @Column(columnDefinition = "TEXT")
    private String outputFormat;
    @Column(columnDefinition = "TEXT")
    private String constraints;
    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<TestCase> testCases;
    @Column(unique = true, nullable = false, length = 64)
    private String contentHash;
    @Enumerated(EnumType.STRING)
    private GenerationSource generationSource;
    private int points;
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
    private boolean isActive;
    private String source;
    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
        updatedDate = LocalDateTime.now();
        isActive = true;
    }
    @PreUpdate
    protected void onUpdate() {
        updatedDate = LocalDateTime.now();
    }
    public enum GenerationSource { LLM_GENERATED, MOCK, IMPORTED }
    public enum ProblemType { QUIZ, CODING }
}