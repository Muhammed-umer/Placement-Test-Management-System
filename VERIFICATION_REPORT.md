# AiService.java Verification Report

**Date**: March 24, 2026  
**File**: `backend/src/main/java/com/example/placement_test_system/service/AiService.java`

---

## 📋 Executive Summary

✅ **Overall Status**: Mostly correct with **1 CRITICAL issue** found in mock generation  
⚠️ **Critical Issue**: Mock questions always place correct answer at position 0, violating randomization requirement  
✅ **Positive**: Prompt structure is well-designed, validation flow is solid, and fallback handling is appropriate

---

## 1. ✅ Prompt Structure (Lines 435-495)

### QUIZ Prompt Verification
**Lines 447-461**: The QUIZ prompt correctly instructs randomization:
- ✅ Explicitly states: `"Correct answer can be a), b), c), or d) - RANDOMLY DISTRIBUTE across questions!"`
- ✅ Includes RANDOMIZATION section emphasizing: `"Make sure NO question has pattern of always correct at a). Shuffle options for each question."`
- ✅ Provides concrete examples showing answers at different positions:
  - Q1: Answer at `a)` ← Correct at position a
  - Q2: Answer at `b)` ← Correct at position b (DIFFERENT!)
  - Q3: Answer at `c)` or `d)` ← Further variation
- ✅ No syntax errors or escaped string issues

### CODING Prompt Verification
**Lines 462-495**: The CODING prompt correctly instructs uniqueness:
- ✅ States: `"Create realistic, solvable, UNIQUE problems"`
- ✅ Emphasizes: `"Every problem should be DIFFERENT from previous ones in the topic. Vary input patterns and edge cases."`
- ✅ Well-structured with clear format specifications
- ✅ No syntax errors

**Result**: ✅ **PASS** - Prompts are well-designed and comprehensive

---

## 2. ✅ Option Cleaning Methods (Lines 137-174)

### cleanOptionPrefixes Method (Lines 137-154)
- ✅ Properly strips `a)`, `b)`, `c)`, `d)` prefixes using regex: `opt.replaceAll("^[a-d]\\)\\s*", "").trim()`
- ✅ Handles JSON arrays correctly
- ✅ Cleans correctAnswer field as well
- ✅ Exception handling with informative error messages

### cleanQuestionPrefixes Method (Lines 156-174)
- ✅ Properly processes individual questions
- ✅ Validates options array exists before processing
- ✅ Handles edge cases (empty correctAnswer)
- ✅ Rebuilds question object correctly using Jackson mapper
- ✅ Returns original question if options don't exist (safe fallback)

### Edge Case Handling
- ✅ Null checks: `question.has("correctAnswer")` before access
- ✅ Empty string handling: `.trim()` applied throughout
- ✅ JSON integrity maintained via ObjectMapper

**Result**: ✅ **PASS** - Methods are robust and handle edge cases well

---

## 3. ✅ Question Validation Flow (Lines 77-133)

### Deduplication via SHA-256 Hash
**Lines 107-113**:
- ✅ Generates hash: `generateUniqueHash(title, description, dto.getTopic(), dto.getDifficulty())`
- ✅ Checks for duplicates: `contestProblemService.existsByHash(contentHash)`
- ✅ Skips duplicates with logging: `"⏭️ Skipping duplicate question"`

### Database Storage
**Lines 116-129**:
- ✅ Stores NEW (non-duplicate) questions: `storeQuestionInDatabase(cleanedQuestion, dto, contentHash)`
- ✅ Cleans prefixes before storage: `JsonNode cleanedQuestion = cleanQuestionPrefixes(question, mapper)`
- ✅ Error handling with try-catch
- ✅ Informative logging: `"✓ NEW question saved"`

### Fallback Handling
**Lines 77-82**:
- ✅ Handles missing ContestProblemService: `"⚠️ ContestProblemService not available, storing skipped"`
- ✅ Still cleans prefixes even when service unavailable: `return cleanOptionPrefixes(jsonQuestions)`
- ✅ Returns cleaned data regardless of storage success

### De-duplication Returns
**Lines 130-133**:
- ✅ Properly handles empty results: Returns `"[]"` if all questions were duplicates
- ✅ Returns cleaned array of new questions as JSON

**Result**: ✅ **PASS** - Validation and storage flow is solid

---

## 4. 🔴 CRITICAL ISSUE - Mock Generation (Lines 818-880)

### Problem: Correct Answer NOT Randomized

**Line 840 (MCQ Section)**:
```java
String correct = options[0]; // First is always correct for mock
```

**Issue**: The mock ALWAYS places the correct answer at index 0 (first position), which violates the prompt instruction to randomize across a/b/c/d positions.

**Expected Behavior**:
- Q1: Correct answer at different position (e.g., index 2 → `c)`)
- Q2: Correct answer at another position (e.g., index 1 → `b)`)
- Q3: Correct answer at yet another position (e.g., index 3 → `d)`)

**Actual Behavior**:
- Q1: Correct at index 0
- Q2: Correct at index 0
- Q3: Correct at index 0
- **Pattern**: ALWAYS at position 0 (violates randomization requirement)

### Impact
- Mock questions don't match LLM instruction quality
- Creates predictable pattern (all answers at first option)
- Inconsistent with real LLM-generated questions
- May cause issues in testing/validation

### How Options Are Added (Lines 834-836)
```java
for (int j = 0; j < options.length; j++) {
    sb.append("\"").append(escapeJson(options[j])).append("\"");
    if (j < options.length - 1) sb.append(",");
}
```
✅ Options correctly added WITHOUT a/b/c/d prefixes (correct for mock format)  
✅ JSON escaping is proper  
❌ But correct answer always at index 0

**Result**: 🔴 **FAIL** - Mock randomization not implemented

---

## 5. ✅ Mock Generation - Other Aspects (Lines 818-1200)

### Mock Topics Parsing & Matching
**generateTopicQuestion (Lines 1005-1028)**:
- ✅ Properly parses topics: `if (topic.contains("tree") || topic.contains("binary"))`
- ✅ Covers: array, tree, sort, graph, greedy, hash
- ✅ Returns topic-specific questions

**generateTopicOptions (Lines 1029-1066)**:
- ✅ Returns plain text options (no prefixes) ✅ CORRECT
- ✅ Topic-aware content
- ✅ Randomized via modulo with index

**generateTopicProblem (Lines 1068-1149)**:
- ✅ Comprehensive problem generation for each topic
- ✅ Input/Output format specifications
- ✅ Realistic constraints

### Coding Test Case Generation
**Lines 845-879**:
- ✅ Attempts code execution via Gemini/Pollinations
- ✅ Falls back to hardcoded test cases
- ✅ Proper error handling with logging

### JSON Escaping
**escapeJson method (Line 1234)**:
- ✅ Properly escapes: `\`, `"`, `\n`, `\r`, `\t`
- ✅ Prevents JSON injection/corruption

**Result**: ✅ **PASS** - All other mock aspects are correct

---

## 6. ✅ Overall Flow (Lines 41-72)

### Source Prioritization
```
Gemini → Pollinations → Mock
```
- ✅ Line 50: `if (geminiApiKey != null && !geminiApiKey.trim().isEmpty())`
- ✅ Line 58: Pollinations as fallback
- ✅ Line 69: Mock as final fallback
- ✅ Each step validates results

### Logging Quality
✅ Clear progression indicators:
- `"[AI Service] 🆕 Generating ONLY NEW questions"`
- `"[AI Service] Attempting Gemini API..."`
- `"[AI Service] ✅ Generated NEW questions using Gemini API"`
- `"[AI Service] Generating NEW mock questions"`

### Null Pointer Safety
- ✅ Line 77: `if (contestProblemService == null)`
- ✅ Line 50: `if (geminiApiKey != null && !geminiApiKey.trim().isEmpty())`
- ✅ Line 55: `if (geminiResult != null && !geminiResult.isEmpty() && !geminiResult.equals("[]"))`

**Result**: ✅ **PASS** - Overall flow is well-structured and safe

---

## 📊 Summary Table

| Aspect | Status | Details |
|--------|--------|---------|
| Prompt: QUIZ randomization | ✅ PASS | Clear instruction for a/b/c/d randomization |
| Prompt: CODING uniqueness | ✅ PASS | Emphasizes unique varied problems |
| Option cleaning: Regex | ✅ PASS | Properly strips `a)`, `b)`, `c)`, `d)` |
| Option cleaning: Edge cases | ✅ PASS | Null/empty handling correct |
| Deduplication: SHA-256 | ✅ PASS | Hash-based detection working |
| Storage: Database | ✅ PASS | NEW questions stored with cleanup |
| Fallback: ContestProblemService | ✅ PASS | Handles unavailability gracefully |
| **Mock: Answer randomization** | 🔴 **FAIL** | Always places at index 0 |
| Mock: Topic parsing | ✅ PASS | Comprehensive topic matching |
| Mock: JSON format | ✅ PASS | Options without prefixes (correct format) |
| Overall flow | ✅ PASS | Gemini → Pollinations → Mock priority |
| Logging | ✅ PASS | Comprehensive and helpful |
| Null safety | ✅ PASS | Proper defensive checks |

---

## 🔧 Recommended Fix

**File**: `AiService.java`  
**Location**: Line 840 in `generateMock` method (MCQ section)

**Current Code**:
```java
String correct = options[0]; // First is always correct for mock
```

**Fixed Code**:
```java
// Randomize which option is correct (don't always put at 0)
Random rand = new Random();
int correctIndex = rand.nextInt(options.length);
String correct = options[correctIndex];
```

**Impact**: Will make mock questions match LLM-quality randomization, aligning with prompt instructions.

---

## ✅ Conclusion

**Overall Assessment**: 
- **7/8 major areas verified** ✅
- **1 critical randomization issue** 🔴
- Implementation is solid except for mock answer position randomization
- Fix is simple and isolated to one line

**Recommendation**: Apply the randomization fix to ensure mock questions align with LLM instruction quality and provide consistent testing experience.
