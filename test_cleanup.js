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
      
      console.log('\n==================== CLEANED PROBLEM ====================');
      console.log('Title:', problem.title || 'N/A');
      console.log('Rating:', problem.rating || 'N/A');
      console.log('\nDescription (First 500 chars):');
      console.log(problem.description ? problem.description.substring(0, 500) : 'N/A');
      console.log('\nInput Format (First 300 chars):');
      console.log(problem.inputFormat ? problem.inputFormat.substring(0, 300) : 'N/A');
      console.log('\nOutput Format (First 300 chars):');
      console.log(problem.outputFormat ? problem.outputFormat.substring(0, 300) : 'N/A');
      console.log('\nTest Cases Count:', problem.testCases?.length || 0);
      if (problem.testCases && problem.testCases.length > 0) {
        console.log('\nFirst Test Case Sample Input (First 200 chars):');
        console.log(problem.testCases[0].input.substring(0, 200));
      }
      console.log('\n=========================================================');
    } catch (e) {
      console.error('Parse error:', e.message);
      console.error('Raw response:', responseData.substring(0, 800));
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.write(data);
req.end();
