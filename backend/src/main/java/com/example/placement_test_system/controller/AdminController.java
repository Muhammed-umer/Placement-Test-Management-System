package com.example.placement_test_system.controller;

import com.example.placement_test_system.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @PostMapping("/onboard")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<String> onboardStudents(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Please upload a valid Excel file");
        }
        try {
            adminService.onboardStudentsFromExcel(file);
            return ResponseEntity.ok("Students onboarded successfully from Excel.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/students")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<java.util.List<com.example.placement_test_system.model.User>> getAllStudents() {
        return ResponseEntity.ok(adminService.getAllStudents());
    }

    @PostMapping("/create-admin")
    @PreAuthorize("hasRole('ROLE_SUPER_ADMIN')")
    public ResponseEntity<String> createAdmin(@RequestBody java.util.Map<String, String> payload) {
        try {
            adminService.createAdmin(payload.get("email"));
            return ResponseEntity.ok("Admin created successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/admins")
    @PreAuthorize("hasRole('ROLE_SUPER_ADMIN')")
    public ResponseEntity<java.util.List<com.example.placement_test_system.model.User>> getAllAdmins() {
        return ResponseEntity.ok(adminService.getAllAdmins());
    }

    @org.springframework.beans.factory.annotation.Autowired
    private com.example.placement_test_system.repository.LeaderboardRepository leaderboardRepository;
    
    @org.springframework.beans.factory.annotation.Autowired
    private com.example.placement_test_system.repository.AssessmentRepository assessmentRepository;

    @GetMapping("/students/{email}/stats")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<java.util.Map<String, Object>> getStudentStats(@PathVariable String email) {
        java.util.List<com.example.placement_test_system.model.LeaderboardEntry> entries = leaderboardRepository.findByStudentEmail(email);
        int quizCount = 0;
        int contestCount = 0;
        int totalQuizScore = 0;
        int totalContestScore = 0;
        
        for (com.example.placement_test_system.model.LeaderboardEntry e : entries) {
            com.example.placement_test_system.model.Assessment a = assessmentRepository.findById(e.getAssessmentId()).orElse(null);
            if (a != null) {
                if ("QUIZ".equals(a.getType().name())) {
                    quizCount++;
                    totalQuizScore += e.getTotalPoints();
                } else if ("CODING".equals(a.getType().name())) {
                    contestCount++;
                    totalContestScore += e.getTotalPoints();
                }
            }
        }
        
        double avgQuiz = quizCount > 0 ? (double) totalQuizScore / quizCount : 0;
        double avgContest = contestCount > 0 ? (double) totalContestScore / contestCount : 0;
        
        return ResponseEntity.ok(java.util.Map.of(
            "quizCount", quizCount,
            "contestCount", contestCount,
            "avgQuizScore", Math.round(avgQuiz * 100.0) / 100.0,
            "avgContestScore", Math.round(avgContest * 100.0) / 100.0
        ));
    }
}
