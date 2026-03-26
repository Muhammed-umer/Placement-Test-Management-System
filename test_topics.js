// Test script to verify topic-aware question generation

const BASE_URL = "http://localhost:8081/api/v1";

// Test credentials
const testUser = {
  email: "student@gcee.ac.in",
  password: "Student@123"
};

// Topics to test
const topics = ["greedy"];

async function login() {
  console.log("🔐 Logging in...");
  try {
    const response = await fetch(`${BASE_URL}/auth/authenticate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUser)
    });

    if (!response.ok) throw new Error(`Login failed: ${response.status}`);
    const data = await response.json();
    console.log("✅ Login successful");
    return data.token;
  } catch (err) {
    console.error("❌ Login error:", err.message);
    throw err;
  }
}

async function generateQuestions(token, topic) {
  console.log(`\n📝 Testing topic: "${topic}"`);
  console.log("=" .repeat(60));

  const payload = {
    topic: topic,
    numQuestions: 1,
    difficulty: "Medium",
    type: "CODING",
    numTestCases: 2
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${BASE_URL}/ai/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const questions = await response.json();
    console.log(`✅ Generated ${questions.length} questions for topic "${topic}"\n`);

    // Display first question in detail
    if (questions.length > 0) {
      const q = questions[0];
      console.log(`📌 First Question:`);
      console.log(`   Title: ${q.title || "N/A"}`);
      console.log(`   Type: ${q.type}`);
      console.log(`   Description: ${(q.description || "").substring(0, 100)}...`);
      console.log(`   Input Format: ${(q.inputFormat || "").substring(0, 60)}...`);
      console.log(`   Test Cases: ${q.testCases?.length || 0}`);
      
      if (q.testCases && q.testCases.length > 0) {
        const tc = q.testCases[0];
        console.log(`   Sample Test Case:`);
        console.log(`     Input: ${(tc.input || "").substring(0, 50)}`);
        console.log(`     Output: ${(tc.expectedOutput || "").substring(0, 50)}`);
        console.log(`     IsSample: ${tc.isSample}`);
      }
    }

    return questions;
  } catch (err) {
    console.error(`❌ Error generating questions for "${topic}":`, err.message);
    return null;
  }
}

async function runTests() {
  try {
    const token = await login();

    for (const topic of topics) {
      await generateQuestions(token, topic);
      await new Promise(r => setTimeout(r, 500)); // Small delay between requests
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ All tests completed!");
  } catch (err) {
    console.error("❌ Test suite failed:", err.message);
  }
}

// Run the tests
runTests();
