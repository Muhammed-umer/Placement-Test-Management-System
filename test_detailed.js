const http = require('http');

const data = JSON.stringify({
  topic: 'string',
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
      const problem = Array.isArray(parsed) ? parsed[0] : parsed.data[0];
      
      console.log('\n================== PROBLEM DETAILS ==================');
      console.log('Title:', problem.title);
      console.log('\nDescription (full):');
      console.log(problem.description);
      console.log('\n--- Input Format ---');
      console.log(problem.inputFormat);
      console.log('\n--- Output Format ---');
      console.log(problem.outputFormat);
      console.log('\n--- Test Cases ---');
      console.log('Count:', problem.testCases?.length || 0);
      if (problem.testCases && problem.testCases.length > 0) {
        console.log('Sample Input:', problem.testCases[0].input.substring(0, 100));
        console.log('Sample Output:', problem.testCases[0].output.substring(0, 100));
      }
      console.log('\n=====================================================');
    } catch (e) {
      console.error('Parse error:', e.message);
      console.error('Raw response (first 1000 chars):', responseData.substring(0, 1000));
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.write(data);
req.end();
