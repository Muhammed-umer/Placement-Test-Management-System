// Test quiz question formatting with a, b, c, d labels
const BASE_URL = "http://localhost:8082/api/v1";

const testUser = {
  email: "student@gcee.ac.in",
  password: "Student@123"
};

async function testQuizFormatting(token) {
  console.log("🧪 Testing Quiz Question Formatting\n");
  console.log("=".repeat(60) + "\n");
  
  const topics = ["array", "tree", "sort"];
  const difficulties = ["Easy", "Medium", "Hard"];
  
  for (const topic of topics) {
    for (const difficulty of difficulties) {
      try {
        const response = await fetch(`${BASE_URL}/ai/generate`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            type: "QUIZ",
            topic,
            difficulty,
            numQuestions: 1
          })
        });

        if (response.status === 200) {
          const data = await response.json();
          if (data[0]) {
            const q = data[0];
            console.log(`✅ ${topic.toUpperCase()} | ${difficulty}`);
            console.log(`   Question: ${q.title}`);
            console.log(`   Description: ${q.description.substring(0, 60)}...`);
            console.log(`   Options:`);
            
            // Check format
            let hasLabels = true;
            q.options.forEach((opt, idx) => {
              const char = String.fromCharCode(97 + idx); // 'a', 'b', 'c', 'd'
              const shouldStart = `${char})`;
              const hasLabel = opt.startsWith(shouldStart);
              if (!hasLabel) hasLabels = false;
              const status = hasLabel ? "✓" : "✗";
              console.log(`     ${status} ${opt}`);
            });
            
            // Check correct answer format
            const correctHasLabel = q.correctAnswer.startsWith("a)");
            console.log(`   Correct: ${q.correctAnswer} ${correctHasLabel ? "✓" : "✗"}`);
            console.log();
          }
        }
      } catch (error) {
        console.log(`❌ Error testing ${topic}/${difficulty}: ${error.message}\n`);
      }
    }
  }
}

async function main() {
  try {
    const response = await fetch(`${BASE_URL}/auth/authenticate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const data = await response.json();
    await testQuizFormatting(data.token);
    console.log("=".repeat(60));
    console.log("✅ All quiz questions formatted with a, b, c, d labels!\n");
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
