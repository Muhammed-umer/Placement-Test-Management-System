// Test AI API endpoint
const http = require('http');

console.log('[Test] Testing /api/v1/ai/generate endpoint');
console.log('[Test] Time:', new Date().toLocaleTimeString());

const postData = JSON.stringify({
  topic: 'Array',
  numQuestions: 2,
  difficulty: 'Easy',
  type: 'QUIZ',
  context: ''
});

const options = {
  hostname: 'localhost',
  port: 8081,
  path: '/api/v1/ai/generate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  },
  timeout: 10000  // 10 second timeout for API call
};

const req = http.request(options, (res) => {
  console.log(`[Test] Response status: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('[Test] Response received, length:', data.length);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        console.log('[Test] Parsed as JSON');
        if (Array.isArray(parsed)) {
          console.log(`[✓] Response is an array with ${parsed.length} items`);
          if (parsed.length === 0) {
            console.log('[✗] Array is EMPTY - Backend returning no questions!');
          } else {
            console.log('[✓] Questions returned:');
            parsed.forEach((q, i) => {
              const title = q.title || q.description || 'No title';
              console.log(`  [Q${i+1}] ${title.substring(0, 60)}`);
            });
          }
        } else {
          console.log('[✗] NOT an array:', typeof parsed);
          console.log('[Data]', JSON.stringify(parsed).substring(0, 200));
        }
      } catch (e) {
        console.log('[✗] Not valid JSON:', e.message);
        console.log('[Raw]', data.substring(0, 300));
      }
    }
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error('[✗] Connection error:', e.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('[✗] Request timed out (>10s)');
  req.destroy();
  process.exit(2);
});

console.log('[Test] Sending request with topic="Array", numQuestions=2...');
req.write(postData);
req.end();

// Safety timeout
setTimeout(() => {
  console.error('[✗] Process hung after 15 seconds');
  process.exit(9);
}, 15000);
