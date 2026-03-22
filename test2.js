const http = require('http');

const payload = {
  id: null,
  title: "Test Contest",
  description: "Contest ID: http...",
  type: "CODING",
  totalPoints: 50,
  durationMinutes: 120,
  startTime: null,
  endTime: null,
  url: "http...",
  allowedLanguages: ['cpp', 'java', 'python', 'c'],
  questions: [
    {
      type: 'CODING',
      title: 'Q1',
      description: 'Desc',
      inputFormat: 'if',
      outputFormat: 'of',
      constraints: 'none',
      points: 50,
      testCases: [
        { input: 'i', expectedOutput: 'o', isSample: false }
      ],
      questionType: 'CODING'
    }
  ]
};

const options = {
  hostname: 'localhost',
  port: 8081,
  path: '/api/v1/assessments',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log(`BODY: ${body}`));
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(JSON.stringify(payload));
req.end();
