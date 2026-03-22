package com.example.placement_test_system.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private com.example.placement_test_system.model.QuestionType questionType; // MCQ, FILL_UP, SHORT_ANSWER, LONG_ANSWER, CHECKBOX, or CODING

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private int points;

    // Quiz Specific
    @ElementCollection
    private List<String> options;
    private String correctAnswer;

    // Coding Specific
    @Column(columnDefinition = "TEXT")
    private String inputFormat;
    @Column(columnDefinition = "TEXT")
    private String outputFormat;
    @Column(columnDefinition = "TEXT")
    private String constraints;

    @OneToMany(cascade = CascadeType.ALL)
    private List<TestCase> testCases;
}