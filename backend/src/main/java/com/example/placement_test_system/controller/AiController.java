package com.example.placement_test_system.controller;

import com.example.placement_test_system.dto.AiGenerateDto;
import com.example.placement_test_system.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/generate")
    public ResponseEntity<String> generateQuestions(@RequestBody AiGenerateDto dto) {
        return ResponseEntity.ok(aiService.generateQuestions(dto));
    }
}
