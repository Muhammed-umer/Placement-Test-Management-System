package com.example.placement_test_system.dto;

import lombok.Data;

@Data
public class AiGenerateDto {
    private String topic;
    private int numQuestions;
    private String difficulty;
    private String type; // "QUIZ" or "CODING"
    private String context; // Text from PDF or document
    private int numTestCases = 5; // Minimum 5 test cases for coding
}
