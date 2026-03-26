const http = require('http');

const data = JSON.stringify({
  topic: 'Array',
  difficulty: 'Easy'
});

const options = {
  hostname: 'localhost',
  port: 8082,
  path: '/api/v1/ai/generate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    try {
      const parsed = JSON.parse(responseData);
      const problems = Array.isArray(parsed) ? parsed : [parsed];
      
      console.log('\n' + '='.repeat(60));
      console.log('MULTIPLE TEST CASES VERIFICATION');
      console.log('='.repeat(60));
      
      problems.forEach((problem, idx) => {
        const testCount = problem.testCases ? problem.testCases.length : 0;
        console.log(`\nProblem ${idx + 1}: ${problem.title}`);
        console.log(`Rating: ${problem.difficulty} | Topic: ${problem.topic}`);
        console.log(`Test Cases Found: ${testCount}`);
        
        if (problem.testCases && problem.testCases.length > 0) {
          problem.testCases.forEach((tc, tcIdx) => {
            const inputPreview = tc.input ? tc.input.substring(0, 50).replace(/\n/g, ' ') + '...' : 'N/A';
            const outputPreview = tc.expectedOutput ? tc.expectedOutput.substring(0, 50).replace(/\n/g, ' ') + '...' : 'N/A';
            console.log(`  Test ${tcIdx + 1}:`);
            console.log(`    Input: ${inputPreview}`);
            console.log(`    Output: ${outputPreview}`);
          });
        }
      });
      
      console.log('\n' + '='.repeat(60));
      console.log('Summary:');
      const totalCases = problems.reduce((sum, p) => sum + (p.testCases ? p.testCases.length : 0), 0);
      console.log(`Total problems: ${problems.length}`);
      console.log(`Total test cases: ${totalCases}`);
      console.log(`Average test cases per problem: ${(totalCases / problems.length).toFixed(1)}`);
      console.log('='.repeat(60) + '\n');
      
    } catch (e) {
      console.error('Parse error:', e.message);
      console.error('Response length:', responseData.length);
      console.error('First 500 chars:', responseData.substring(0, 500));
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error.message);
});

req.write(data);
req.end();
