const http = require('http');

const data = JSON.stringify({topic: 'Array', difficulty: 'Easy'});
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
  res.on('data', (chunk) => { responseData += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(responseData);
      console.log('\n═══════════════════════════════════════════');
      console.log('CONSTRAINTS EXTRACTION TEST');
      console.log('═══════════════════════════════════════════\n');
      
      json.slice(0, 3).forEach((problem, idx) => {
        console.log(`Problem ${idx + 1}: ${problem.title}`);
        console.log(`Constraints: ${problem.constraints}`);
        console.log('---\n');
      });
      
      console.log('═══════════════════════════════════════════\n');
    } catch(e) {
      console.error('Error:', e.message);
    }
  });
});

req.write(data);
req.end();
