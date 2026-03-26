package com.example.placement_test_system.service;

import com.example.placement_test_system.model.ContestProblem;
import com.example.placement_test_system.repository.ContestProblemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ContestProblemService {
    private final ContestProblemRepository contestProblemRepository;
    
    public String generateContentHash(String title, String description, String topic, String difficulty) throws Exception {
        String content = title + "|" + description + "|" + topic + "|" + difficulty;
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(content.getBytes(StandardCharsets.UTF_8));
        
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }
    
    public boolean existsByHash(String contentHash) {
        return contestProblemRepository.existsByContentHash(contentHash);
    }
    
    public void saveProblemDirect(ContestProblem problem) {
        if (problem.getId() == null) {
            contestProblemRepository.save(problem);
        }
    }
    
    public List<ContestProblem> getProblemsByTopicAndDifficulty(String topic, String difficulty) {
        return contestProblemRepository.findByTopicAndDifficultyAndIsActive(topic, difficulty, true);
    }
    
    public long getTotalProblemsStored(String topic) {
        return contestProblemRepository.countByTopicAndIsActive(topic, true);
    }
    
    public long getTotalProblemsStoredByDifficulty(String topic, String difficulty) {
        return contestProblemRepository.countByTopicAndDifficultyAndIsActive(topic, difficulty, true);
    }
}