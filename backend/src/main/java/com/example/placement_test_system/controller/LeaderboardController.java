package com.example.placement_test_system.controller;

import com.example.placement_test_system.model.LeaderboardEntry;
import com.example.placement_test_system.repository.LeaderboardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
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

    @GetMapping("/{assessmentId}")
    public ResponseEntity<List<LeaderboardEntry>> getLeaderboard(@PathVariable Long assessmentId) {
        return ResponseEntity.ok(leaderboardRepository.findByAssessmentIdOrderByTotalPointsDescFinishTimeAsc(assessmentId));
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submitScore(@RequestBody Map<String, Object> payload) {
        Long assessmentId = Long.valueOf(payload.get("assessmentId").toString());
        String studentEmail = (String) payload.get("studentEmail");
        String studentName = (String) payload.get("studentName");
        int points = Integer.parseInt(payload.get("points").toString());

        LeaderboardEntry entry = leaderboardRepository.findByAssessmentIdAndStudentEmail(assessmentId, studentEmail);
        if (entry == null) {
            entry = LeaderboardEntry.builder()
                    .assessmentId(assessmentId)
                    .studentEmail(studentEmail)
                    .studentName(studentName)
                    .totalPoints(points)
                    .finishTime(LocalDateTime.now())
                    .build();
        } else {
            entry.setTotalPoints(entry.getTotalPoints() + points);
            entry.setFinishTime(LocalDateTime.now());
        }

        leaderboardRepository.save(entry);

        // Broadcast a leaderboard update
        messagingTemplate.convertAndSend("/topic/leaderboard/" + assessmentId, "UPDATE");

        return ResponseEntity.ok().build();
    }
}
