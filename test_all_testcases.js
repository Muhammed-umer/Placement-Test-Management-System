// Test script to verify test case generation for all topics with multiple cases
const BASE_URL = "http://localhost:8082/api/v1";

const testUser = {
  email: "student@gcee.ac.in",
  password: "Student@123"
};

const testCases = [
  // Array - request 5 test cases beyond the original 3
  { type: "CODING", topic: "array", difficulty: "Easy", numQuestions: 1, numTestCases: 6 },
  // Tree - request many test cases
  { type: "CODING", topic: "tree", difficulty: "Medium", numQuestions: 1, numTestCases: 7 },
  // Graph - NEW topic, should generate test cases
  { type: "CODING", topic: "graph", difficulty: "Hard", numQuestions: 1, numTestCases: 5 },
  // Hash - NEW topic, should generate test cases  
  { type: "CODING", topic: "hash", difficulty: "Medium", numQuestions: 1, numTestCases: 5 },
  // Sort - request more cases
  { type: "CODING", topic: "sort", difficulty: "Hard", numQuestions: 1, numTestCases: 6 },
  // Greedy - request more cases
  { type: "CODING", topic: "greedy", difficulty: "Easy", numQuestions: 1, numTestCases: 5 }
];

async function login() {
  const response = await fetch(`${BASE_URL}/auth/authenticate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser)
  });
  const data = await response.json();
  if (!data.token) throw new Error("Login failed");
  return data.token;
}

function hasPlaceholderText(str) {
  return str && (str.includes("Sample input") || str.includes("Sample output"));
}

function countTestCases(jsonResponse) {
  try {
    const data = JSON.parse(jsonResponse);
    if (Array.isArray(data) && data[0] && data[0].testCases) {
      return data[0].testCases.length;
    }
  } catch (e) {}
  return 0;
}

async function testTopicTestCases(token) {
  console.log("🧪 Testing Test Case Generation for All Topics\n");
  console.log("=".repeat(60) + "\n");
  
  let passCount = 0;
  let failCount = 0;

  for (const test of testCases) {
    const testLabel = `${test.topic.toUpperCase()} | ${test.difficulty} | Requesting ${test.numTestCases} cases`;
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
        const responseText = await response.text();
        const data = JSON.parse(responseText);
        
        if (Array.isArray(data) && data.length > 0 && data[0].testCases) {
          const cases = data[0].testCases;
          const caseCount = cases.length;
          
          // Check if any test case has placeholder text
          let hasPlaceholder = false;
          cases.forEach((tc, idx) => {
            if (hasPlaceholderText(tc.input) || hasPlaceholderText(tc.expectedOutput)) {
              hasPlaceholder = true;
              console.log(`   ⚠️  Case ${idx}: Has placeholder text!`);
            }
          });
          
          if (!hasPlaceholder) {
            console.log(`✅ PASSED: Generated ${caseCount} realistic test cases`);
            console.log(`   Sample Case 1: Input = "${cases[0].input.substring(0, 40)}..."`);
            if (caseCount >= 2) {
              console.log(`   Sample Case 2: Input = "${cases[1].input.substring(0, 40)}..."`);
            }
            passCount++;
          } else {
            console.log(`❌ FAILED: Contains placeholder text`);
            failCount++;
          }
        } else {
          console.log(`❌ FAILED: Invalid response structure`);
          failCount++;
        }
      } else {
        const errorText = await response.text();
        console.log(`❌ FAILED: Status ${response.status}`);
        failCount++;
      }
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
      failCount++;
    }
    console.log();
  }

  console.log("=".repeat(60));
  console.log(`\n📊 Results: ${passCount} Passed | ${failCount} Failed\n`);
  return failCount === 0;
}

async function main() {
  try {
    console.log("🔐 Logging in...\n");
    const token = await login();
    console.log("✅ Login successful\n\n");
    
    const success = await testTopicTestCases(token);
    
    if (success) {
      console.log("✅ All topics generating realistic test cases!");
      process.exit(0);
    } else {
      console.log("❌ Some topics have placeholder text issues");
      process.exit(1);
    }
  } catch (err) {
    console.error("Fatal error:", err);
    process.exit(1);
  }
}

main();
