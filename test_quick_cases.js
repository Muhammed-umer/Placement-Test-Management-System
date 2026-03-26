// Quick test to verify all topics generate real test cases
const BASE_URL = "http://localhost:8082/api/v1";

const testUser = {
  email: "student@gcee.ac.in",
  password: "Student@123"
};

async function testTopic(token, topic, difficulty) {
  const response = await fetch(`${BASE_URL}/ai/generate`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      type: "CODING",
      topic,
      difficulty,
      numQuestions: 1,
      numTestCases: 5
    }),
    timeout: 8000
  });

  if (response.status === 200) {
    const data = await response.json();
    if (data[0]?.testCases) {
      const cases = data[0].testCases;
      const hasReal = cases.some(c => !c.input.includes("Sample"));
      const status = hasReal ? "✅" : "❌";
      console.log(`${status} ${topic.padEnd(8)} - ${cases.length} cases (Real: ${hasReal})`);
      return hasReal;
    }
  }
  console.log(`❌ ${topic.padEnd(8)} - Error`);
  return false;
}

async function main() {
  try {
    const response = await fetch(`${BASE_URL}/auth/authenticate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const data = await response.json();
    const token = data.token;

    console.log("\nTest Case Generation Results:\n");
    
    const topics = ["array", "tree", "graph", "sort", "hash", "greedy"];
    let passed = 0;

    for (const topic of topics) {
      if (await testTopic(token, topic, "Medium")) {
        passed++;
      }
    }

    console.log(`\n✅ ${passed}/${topics.length} topics generating real test cases\n`);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

main();
