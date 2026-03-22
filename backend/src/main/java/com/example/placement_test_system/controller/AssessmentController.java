package com.example.placement_test_system.controller;

import com.example.placement_test_system.model.Assessment;
import com.example.placement_test_system.repository.AssessmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/assessments")
@RequiredArgsConstructor
public class AssessmentController {

    private final AssessmentRepository assessmentRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping
    public ResponseEntity<?> createAssessment(@RequestBody Assessment assessment) {
        if (assessment.getTitle() == null || assessment.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Assessment title is required.");
        }
        if (assessment.getQuestions() == null || assessment.getQuestions().isEmpty()) {
            return ResponseEntity.badRequest().body("At least one question is required to publish the assessment.");
        }

        Assessment savedAssessment = assessmentRepository.save(assessment);
        
        // Broadcast a notification when a new assessment is published
        messagingTemplate.convertAndSend("/topic/assessments", "New Assessment Published: " + savedAssessment.getTitle());
        
        return ResponseEntity.ok(savedAssessment);
    }

    @GetMapping
    public ResponseEntity<List<Assessment>> getAllAssessments() {
        return ResponseEntity.ok(assessmentRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Assessment> getAssessmentById(@PathVariable Long id) {
        return assessmentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.<Assessment>notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAssessment(@PathVariable Long id) {
        if (!assessmentRepository.existsById(id)) {
            return ResponseEntity.<Void>notFound().build();
        }
        assessmentRepository.deleteById(id);
        return ResponseEntity.<Void>ok().build();
    }
}
