// Test script to verify improved prompts generate difficulty-aware questions

const BASE_URL = "http://localhost:8081/api/v1";

const testUser = {
  email: "student@gcee.ac.in",
  password: "Student@123"
};

// Test different topics with different difficulty levels
const tests = [
  { topic: "array", difficulty: "Easy", type: "QUIZ" },
  { topic: "array", difficulty: "Medium", type: "QUIZ" },
  { topic: "array", difficulty: "Hard", type: "QUIZ" },
  { topic: "greedy", difficulty: "Easy", type: "CODING" },
  { topic: "greedy", difficulty: "Medium", type: "CODING" },
  { topic: "greedy", difficulty: "Hard", type: "CODING" }
];

async function login() {
  try {
    const response = await fetch(`${BASE_URL}/auth/authenticate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUser)
    });
    const data = await response.json();
    return data.token;
  } catch (err) {
    console.error("❌ Login error:", err.message);
    throw err;
  }
}

async function testQuestion(token, topic, difficulty, type) {
  const payload = {
    topic: topic,
    numQuestions: 1,
    difficulty: difficulty,
    type: type,
    numTestCases: 2
  };

  try {
    const response = await fetch(`${BASE_URL}/ai/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const questions = await response.json();
    if (questions.length === 0) return null;

    const q = questions[0];
    return {
      topic,
      difficulty,
      type,
      title: q.title || "N/A",
      description: (q.description || "").substring(0, 100),
      options: q.options?.length || 0,
      testCases: q.testCases?.length || 0
    };
  } catch (err) {
    console.error(`❌ Error for ${topic}/${difficulty}:`, err.message);
    return null;
  }
}

async function runTests() {
  try {
    const token = await login();
    console.log("✅ Logged in successfully\n");

    for (const test of tests) {
      const result = await testQuestion(token, test.topic, test.difficulty, test.type);
      
      if (result) {
        console.log(`📌 ${result.type} | ${result.topic} | ${result.difficulty}`);
        console.log(`   Title: ${result.title}`);
        console.log(`   Description: ${result.description}...`);
        console.log(`   Options/TestCases: ${result.options || result.testCases}`);
      }
      console.log();
      
      await new Promise(r => setTimeout(r, 1000)); // Delay between requests
    }

    console.log("✅ All tests completed!");
  } catch (err) {
    console.error("❌ Test failed:", err.message);
  }
}

runTests();
