// Test script to verify AI generation fix
const BASE_URL = "http://localhost:8082/api/v1";

const testUser = {
  email: "student@gcee.ac.in",
  password: "Student@123"
};

const testCases = [
  { type: "QUIZ", topic: "array", difficulty: "Easy", numQuestions: 1 },
  { type: "QUIZ", topic: "array", difficulty: "Medium", numQuestions: 1 },
  { type: "QUIZ", topic: "array", difficulty: "Hard", numQuestions: 1 },
  { type: "CODING", topic: "greedy", difficulty: "Easy", numQuestions: 1, numTestCases: 3 },
  { type: "CODING", topic: "greedy", difficulty: "Hard", numQuestions: 1, numTestCases: 5 }
];

async function login() {
  console.log("🔐 Logging in...\n");
  const response = await fetch(`${BASE_URL}/auth/authenticate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser)
  });
  const data = await response.json();
  if (!data.token) throw new Error("Login failed: no token");
  console.log("✅ Logged in successfully\n");
  return data.token;
}

async function testAiGeneration(token) {
  console.log("🧪 Testing AI Generation Fix\n");
  console.log("================================\n");
  
  for (const test of testCases) {
    const testLabel = `${test.type} | ${test.topic} | ${test.difficulty}`;
    try {
      console.log(`Testing: ${testLabel}...`);
      
      const response = await fetch(`${BASE_URL}/ai/generate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(test)
      });

      if (response.status === 200) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          console.log(`✅ PASSED: Generated ${data.length} item(s)`);
          console.log(`   Sample: ${JSON.stringify(data[0]).substring(0, 80)}...`);
        } else {
          console.log(`⚠️  WARNING: Response is empty array`);
        }
      } else {
        const errorText = await response.text();
        console.log(`❌ FAILED: Status ${response.status}`);
        console.log(`   Error: ${errorText.substring(0, 100)}`);
      }
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
    }
    console.log();
  }
}


async function main() {
  try {
    const token = await login();
    await testAiGeneration(token);
    console.log("✅ All tests completed!");
    process.exit(0);
  } catch (err) {
    console.error("Fatal error:", err);
    process.exit(1);
  }
}

main();
