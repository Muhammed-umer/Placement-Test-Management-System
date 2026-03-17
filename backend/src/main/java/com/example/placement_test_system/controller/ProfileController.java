package com.example.placement_test_system.controller;

import com.example.placement_test_system.model.User;
import com.example.placement_test_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getMyProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            return ResponseEntity.ok(userOpt.get());
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> updates) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        
        if (updates.containsKey("githubLink")) user.setGithubLink(updates.get("githubLink"));
        if (updates.containsKey("linkedinLink")) user.setLinkedinLink(updates.get("linkedinLink"));
        if (updates.containsKey("projectShowcase")) user.setProjectShowcase(updates.get("projectShowcase"));
        if (updates.containsKey("achievements")) user.setAchievements(updates.get("achievements"));

        userRepository.save(user);
        return ResponseEntity.ok(user);
    }
}
