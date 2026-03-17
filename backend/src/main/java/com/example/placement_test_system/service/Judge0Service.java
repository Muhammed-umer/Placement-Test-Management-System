package com.example.placement_test_system.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
public class Judge0Service {

    @Value("${judge0.api.url}")
    private String judge0BaseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @Async
    public CompletableFuture<Map<String, Object>> submitCode(String sourceCode, int languageId, String stdin) {
        // Request payload
        Map<String, Object> payload = new HashMap<>();
        payload.put("source_code", sourceCode);
        payload.put("language_id", languageId);
        payload.put("stdin", stdin);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);

        try {
            // Send submission
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    judge0BaseUrl + "/submissions?base64_encoded=false&wait=true",
                    requestEntity,
                    Map.class
            );
            return CompletableFuture.completedFuture(response.getBody());
        } catch (Exception e) {
            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("error", "Execution failed: " + e.getMessage());
            return CompletableFuture.completedFuture(errorMap);
        }
    }
}
