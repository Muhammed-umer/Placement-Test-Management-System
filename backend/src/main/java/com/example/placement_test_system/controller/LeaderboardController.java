package com.example.placement_test_system.controller;

import com.example.placement_test_system.model.LeaderboardEntry;
import com.example.placement_test_system.repository.LeaderboardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardRepository leaderboardRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final com.example.placement_test_system.repository.AssessmentRepository assessmentRepository;
    private final com.example.placement_test_system.repository.UserRepository userRepository;
    private final com.example.placement_test_system.service.Judge0Service judge0Service;

    @GetMapping("/{assessmentId}")
    public ResponseEntity<List<LeaderboardEntry>> getLeaderboard(@PathVariable Long assessmentId) {
        return ResponseEntity.ok(leaderboardRepository.findByAssessmentIdOrderByTotalPointsDescFinishTimeAsc(assessmentId));
    }

    @GetMapping("/check/{assessmentId}")
    public ResponseEntity<Boolean> checkAttemptsAllowed(@PathVariable Long assessmentId) {
        String studentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        LeaderboardEntry entry = leaderboardRepository.findByAssessmentIdAndStudentEmail(assessmentId, studentEmail);
        com.example.placement_test_system.model.Assessment assessment = assessmentRepository.findById(assessmentId).orElse(null);
        if (assessment == null) return ResponseEntity.ok(true);
        
        int maxAttempts = Math.max(1, assessment.getMaxAttempts());
        if (entry != null && entry.getAttempts() >= maxAttempts) {
            return ResponseEntity.ok(false);
        }
        return ResponseEntity.ok(true);
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submitScore(@RequestBody Map<String, Object> payload) {
        Long assessmentId = Long.valueOf(payload.get("assessmentId").toString());
        String studentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        com.example.placement_test_system.model.User user = userRepository.findByEmail(studentEmail).orElseThrow();
        String studentName = user.getFullName() != null ? user.getFullName() : user.getEmail();

        com.example.placement_test_system.model.Assessment assessment = assessmentRepository.findById(assessmentId).orElse(null);
        if (assessment == null) return ResponseEntity.badRequest().body("Assessment not found");

        int points = 0;
        int totalQuestions = assessment.getQuestions().size();
        int attended = 0;
        int correct = 0;
        int wrong = 0;

        if (assessment.getType().name().equals("QUIZ")) {
            if (payload.containsKey("answers")) {
                Map<String, Object> answers = (Map<String, Object>) payload.get("answers");
                attended = answers.size();
                for (com.example.placement_test_system.model.Question q : assessment.getQuestions()) {
                    if (answers.containsKey(q.getId().toString())) {
                        String userAns = answers.get(q.getId().toString()).toString();
                        if (q.getCorrectAnswer() != null && q.getCorrectAnswer().equals(userAns)) {
                            points += q.getPoints();
                            correct++;
                        } else {
                            wrong++;
                        }
                    }
                }
            }
        } else if (assessment.getType().name().equals("CODING")) {
            if (payload.containsKey("code") && payload.containsKey("languageId")) {
                String sourceCode = payload.get("code").toString();
                int langId = Integer.parseInt(payload.get("languageId").toString());
                if (!assessment.getQuestions().isEmpty()) {
                    com.example.placement_test_system.model.Question q = assessment.getQuestions().get(0);
                    int passedCases = 0;
                    if (q.getTestCases() != null && !q.getTestCases().isEmpty()) {
                        for (com.example.placement_test_system.model.TestCase tc : q.getTestCases()) {
                            try {
                                Map<String, Object> res = judge0Service.submitCode(sourceCode, langId, tc.getInput()).get();
                                if (res.containsKey("stdout") && res.get("stdout") != null) {
                                    String decodedOut = new String(java.util.Base64.getDecoder().decode(res.get("stdout").toString())).trim();
                                    if (tc.getExpectedOutput() != null && tc.getExpectedOutput().trim().equals(decodedOut)) {
                                        passedCases++;
                                    }
                                }
                            } catch (Exception e) {}
                        }
                        points += (q.getPoints() * passedCases) / q.getTestCases().size();
                        correct = passedCases;
                        totalQuestions = q.getTestCases().size();
                        wrong = totalQuestions - correct;
                        attended = totalQuestions;
                    }
                }
            }
        }

        LeaderboardEntry entry = leaderboardRepository.findByAssessmentIdAndStudentEmail(assessmentId, studentEmail);
        int maxAttempts = Math.max(1, assessment.getMaxAttempts());

        if (entry == null) {
            entry = LeaderboardEntry.builder()
                    .assessmentId(assessmentId)
                    .studentEmail(studentEmail)
                    .studentName(studentName)
                    .totalPoints(points)
                    .attempts(1)
                    .finishTime(LocalDateTime.now())
                    .build();
        } else {
            if (entry.getAttempts() >= maxAttempts) {
                return ResponseEntity.badRequest().body("Maximum attempts reached.");
            }
            entry.setTotalPoints(Math.max(entry.getTotalPoints(), points));
            entry.setAttempts(entry.getAttempts() + 1);
            entry.setFinishTime(LocalDateTime.now());
        }

        leaderboardRepository.save(entry);

        // Broadcast a leaderboard update
        messagingTemplate.convertAndSend("/topic/leaderboard/" + assessmentId, "UPDATE");

        return ResponseEntity.ok(Map.of(
            "points", points,
            "totalQuestions", totalQuestions,
            "attended", attended,
            "correct", correct,
            "wrong", wrong
        ));
    }
}
