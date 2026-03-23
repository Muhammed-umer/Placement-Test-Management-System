package com.example.placement_test_system.service;

import com.example.placement_test_system.dto.AiGenerateDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@Service
public class AiService {

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    public String generateQuestions(AiGenerateDto dto) {
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty()) {
            return generateMock(dto);
        }

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + geminiApiKey;

        String prompt = buildPrompt(dto);

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = new HashMap<>();
        Map<String, Object> parts = new HashMap<>();
        parts.put("text", prompt);
        
        Map<String, Object> contents = new HashMap<>();
        contents.put("parts", List.of(parts));
        
        requestBody.put("contents", List.of(contents));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            return parseGeminiResponse(response.getBody());
        } catch (Exception e) {
            System.err.println("[AI Service] Gemini API Rate Limit Exceeded or Error. Falling back to Mock Questions safely.");
            return generateMock(dto); // Fallback to mock on error
        }
    }

    private String buildPrompt(AiGenerateDto dto) {
        int num = dto.getNumQuestions() > 0 ? dto.getNumQuestions() : 5;
        if ("QUIZ".equalsIgnoreCase(dto.getType())) {
            return String.format(
                "You are an assessment expert. Generate %d multiple-choice questions about '%s' at '%s' difficulty level. " +
                "Respond strictly with a JSON array without markdown wrapping. Each object must exactly match this structure: " +
                "{\"questionType\": \"MCQ\", \"title\": \"<question>\", \"options\": [\"<A>\", \"<B>\", \"<C>\", \"<D>\"], " +
                "\"correctAnswer\": \"<correct option exactly as in options>\", \"points\": 10}",
                num, dto.getTopic(), dto.getDifficulty()
            );
        } else {
            return String.format(
                "You are a coding instructor. Generate %d competitive programming problems about '%s' at '%s' difficulty level. " +
                "Respond strictly with a JSON array without markdown wrapping. Each object must exactly match this structure: " +
                "{\"type\": \"CODING\", \"title\": \"<problem name>\", \"description\": \"<detailed problem description>\", " +
                "\"inputFormat\": \"<input format>\", \"outputFormat\": \"<output format>\", \"constraints\": \"<constraints>\", " +
                "\"points\": 50, \"testCases\": [{\"input\": \"<sample input>\", \"expectedOutput\": \"<sample output>\", \"isSample\": true}]}",
                num, dto.getTopic(), dto.getDifficulty()
            );
        }
    }

    private String parseGeminiResponse(String jsonString) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(jsonString);
            JsonNode textNode = root.path("candidates").get(0).path("content").path("parts").get(0).path("text");
            if (textNode.isMissingNode()) return "[]";
            String text = textNode.asText().trim();
            if (text.startsWith("```json")) {
                text = text.substring(7);
            } else if (text.startsWith("```")) {
                text = text.substring(3);
            }
            if (text.endsWith("```")) {
                text = text.substring(0, text.length() - 3);
            }
            return text.trim();
        } catch (Exception e) {
            return "[]";
        }
    }
    
    private String generateMock(AiGenerateDto dto) {
        int num = dto.getNumQuestions() > 0 ? dto.getNumQuestions() : 1;
        StringBuilder sb = new StringBuilder();
        sb.append("[");
        for (int i = 0; i < num; i++) {
            if ("QUIZ".equalsIgnoreCase(dto.getType())) {
                sb.append("{\"questionType\":\"MCQ\",\"title\":\"AI Generated Mock Question " + (i + 1) + " about " + dto.getTopic() + " (" + dto.getDifficulty() + ")\",\"options\":[\"Mock A\",\"Mock B\",\"Mock C\",\"Mock D\"],\"correctAnswer\":\"Mock A\",\"points\":10}");
            } else {
                sb.append("{\"type\":\"CODING\",\"title\":\"AI Generated Mock Coding Problem " + (i + 1) + " about " + dto.getTopic() + " (" + dto.getDifficulty() + ")\",\"description\":\"This is an AI generated mock description. Print a solution.\",\"inputFormat\":\"None required.\",\"outputFormat\":\"A single output string.\",\"constraints\":\"None.\",\"points\":50,\"testCases\":[{\"input\":\"\",\"expectedOutput\":\"solution\",\"isSample\":true}]}");
            }
            if (i < num - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }
}
