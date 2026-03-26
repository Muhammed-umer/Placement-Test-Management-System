const http = require('http');

const data = JSON.stringify({
  topic: 'Array',
  difficulty: 'Medium'
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
      
      console.log('\n╔════════════════════════════════════════════╗');
      console.log('║          FORMATTED PROBLEM OUTPUT          ║');
      console.log('╚════════════════════════════════════════════╝');
      console.log('\nTitle:', problem.title);
      console.log('\nDescription:\n' + problem.description);
      console.log('\n--- Input Format ---\n' + problem.inputFormat);
      console.log('\n--- Output Format ---\n' + problem.outputFormat);
      console.log('\n--- Constraints ---\n' + problem.constraints);
      console.log('\n--- Test Cases: ' + (problem.testCases?.length || 0) + ' ---');
      if (problem.testCases && problem.testCases.length > 0) {
        console.log('\nSample Input:\n' + problem.testCases[0].input.substring(0, 150));
        console.log('\nSample Output:\n' + problem.testCases[0].output.substring(0, 150));
      }
      console.log('\n═══════════════════════════════════════════════');
    } catch (e) {
      console.error('Parse error:', e.message);
      console.error('Response:', responseData.substring(0, 500));
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.write(data);
req.end();
