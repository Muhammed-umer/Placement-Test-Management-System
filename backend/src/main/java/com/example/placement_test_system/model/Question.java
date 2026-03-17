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

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description; // Used for problem statement or quiz question text

    private int points;

    // Quiz Specific Fields
    @ElementCollection
    private List<String> options; // For MCQs
    private String correctAnswer;

    // Coding Specific Fields (for Judge0)
    @Column(columnDefinition = "TEXT")
    private String inputFormat;
    @Column(columnDefinition = "TEXT")
    private String outputFormat;
    @Column(columnDefinition = "TEXT")
    private String constraints;

    @OneToMany(cascade = CascadeType.ALL)
    private List<TestCase> testCases;
}