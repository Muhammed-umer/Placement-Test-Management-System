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

    @Value("${huggingface.api.key:}")
    private String huggingFaceApiKey;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    public String generateQuestions(AiGenerateDto dto) {
        if (huggingFaceApiKey != null && !huggingFaceApiKey.trim().isEmpty()) {
            return generateWithHuggingFace(dto);
        } else if (geminiApiKey != null && !geminiApiKey.trim().isEmpty()) {
            return generateWithGemini(dto);
        } else {
            // Fallback to pollinations.ai
            return generateWithPollinations(dto);
        }
    }

    private String generateWithHuggingFace(AiGenerateDto dto) {
        String url = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1";
        String prompt = buildPrompt(dto);

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(huggingFaceApiKey);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("inputs", prompt);
        requestBody.put("parameters", Map.of(
            "max_new_tokens", 1024,
            "temperature", 0.7,
            "do_sample", true,
            "return_full_text", false
        ));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            return parseHuggingFaceResponse(response.getBody());
        } catch (Exception e) {
            System.err.println("[AI Service] HuggingFace API Error: " + e.getMessage());
            return generateMock(dto);
        }
    }

    private String generateWithGemini(AiGenerateDto dto) {
        // Keep existing Gemini implementation if needed
        return generateWithPollinations(dto);
    }

    private String generateWithPollinations(AiGenerateDto dto) {
        String url = "https://text.pollinations.ai/openai";
        String prompt = buildPrompt(dto);

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = new HashMap<>();
        Map<String, String> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", prompt);
        requestBody.put("messages", List.of(message));
        requestBody.put("model", "llama"); // Strictly enforce LLaMA
        requestBody.put("jsonMode", true);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            return parseAiResponse(response.getBody());
        } catch (Exception e) {
            System.err.println("[AI Service] API Error. Falling back to Mock Questions safely: " + e.getMessage());
            return generateMock(dto);
        }
    }

    private String buildPrompt(AiGenerateDto dto) {
        int num = dto.getNumQuestions() > 0 ? dto.getNumQuestions() : 5;
        String baseStr = "";
        
        if ("QUIZ".equalsIgnoreCase(dto.getType())) {
            baseStr = String.format(
                "You are an assessment expert. Generate %d multiple-choice questions about '%s' at '%s' difficulty level. " +
                "Respond strictly with a JSON array without markdown wrapping. Each object must exactly match this structure: " +
                "{\"questionType\": \"MCQ\", \"title\": \"<question>\", \"options\": [\"<A>\", \"<B>\", \"<C>\", \"<D>\"], " +
                "\"correctAnswer\": \"<correct option exactly as in options>\", \"points\": 10}",
                num, dto.getTopic(), dto.getDifficulty()
            );
        } else {
            int testCases = Math.max(dto.getNumTestCases(), 5); // Minimum 5 test cases
            baseStr = String.format(
                "You are a coding instructor. Generate %d competitive programming problems about '%s' at '%s' difficulty level. " +
                "For each problem, generate exactly %d test cases. " +
                "Respond strictly with a JSON array without markdown wrapping. Each object must exactly match this structure: " +
                "{\"type\": \"CODING\", \"title\": \"<problem name>\", \"description\": \"<detailed problem description>\", " +
                "\"inputFormat\": \"<input format>\", \"outputFormat\": \"<output format>\", \"constraints\": \"<constraints>\", " +
                "\"points\": 50, \"testCases\": [{\"input\": \"<sample input>\", \"expectedOutput\": \"<sample output>\", \"isSample\": true}, ...] " +
                "with exactly %d test cases}",
                num, dto.getTopic(), dto.getDifficulty(), testCases, testCases
            );
        }
        
        if (dto.getContext() != null && !dto.getContext().trim().isEmpty()) {
            baseStr += "\n\nUse this extremely important context document to extract and adapt the questions:\n" + dto.getContext();
        }
        
        return baseStr;
    }

    private String parseHuggingFaceResponse(String text) {
        try {
            if (text == null) return "[]";
            
            // Parse the JSON response from HuggingFace
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(text);
            
            if (root.isArray() && root.size() > 0) {
                // Extract the generated text from the first item
                String generatedText = root.get(0).get("generated_text").asText();
                return parseAiResponse(generatedText);
            }
            
            return "[]";
        } catch (Exception e) {
            System.err.println("[AI Service] Error parsing HuggingFace response: " + e.getMessage());
            return "[]";
        }
    }
    
    private String generateMock(AiGenerateDto dto) {
        int num = dto.getNumQuestions() > 0 ? dto.getNumQuestions() : 1;
        int testCases = Math.max(dto.getNumTestCases(), 5); // Minimum 5 test cases
        StringBuilder sb = new StringBuilder();
        sb.append("[");
        for (int i = 0; i < num; i++) {
            if ("QUIZ".equalsIgnoreCase(dto.getType())) {
                sb.append("{\"questionType\":\"MCQ\",\"title\":\"AI Generated Mock Question " + (i + 1) + " about " + dto.getTopic() + " (" + dto.getDifficulty() + ")\",\"options\":[\"Mock A\",\"Mock B\",\"Mock C\",\"Mock D\"],\"correctAnswer\":\"Mock A\",\"points\":10}");
            } else {
                sb.append("{\"type\":\"CODING\",\"title\":\"AI Generated Mock Coding Problem " + (i + 1) + " about " + dto.getTopic() + " (" + dto.getDifficulty() + ")\",\"description\":\"This is an AI generated mock description. Print a solution.\",\"inputFormat\":\"None required.\",\"outputFormat\":\"A single output string.\",\"constraints\":\"None.\",\"points\":50,\"testCases\":[");
                for (int j = 0; j < testCases; j++) {
                    sb.append("{\"input\":\"\",\"expectedOutput\":\"solution\",\"isSample\":true}");
                    if (j < testCases - 1) sb.append(",");
                }
                sb.append("]}");
            }
            if (i < num - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }
}
