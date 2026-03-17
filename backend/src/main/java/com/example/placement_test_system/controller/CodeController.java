package com.example.placement_test_system.controller;

import com.example.placement_test_system.service.Judge0Service;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/v1/code")
@RequiredArgsConstructor
public class CodeController {

    private final Judge0Service judge0Service;

    @PostMapping("/run")
    public CompletableFuture<ResponseEntity<Map<String, Object>>> runCode(@RequestBody Map<String, Object> payload) {
        String sourceCode = (String) payload.get("source_code");
        int languageId = (Integer) payload.get("language_id");
        String stdin = (String) payload.getOrDefault("stdin", "");

        return judge0Service.submitCode(sourceCode, languageId, stdin)
                .thenApply(ResponseEntity::ok);
    }
}
