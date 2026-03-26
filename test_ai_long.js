// Test AI API with longer timeout
const http = require('http');

console.log('[Test] Testing /api/v1/ai/generate with 30 second timeout');

const postData = JSON.stringify({
  topic: 'Array',
  numQuestions: 1,  // Just 1 question for faster response
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
  timeout: 30000  // 30 second timeout
};

console.log(`[${new Date().toLocaleTimeString()}] Sending request...`);
const startTime = Date.now();

const req = http.request(options, (res) => {
  const elapsed = Math.round((Date.now() - startTime) / 1000);
  console.log(`[${new Date().toLocaleTimeString()}] Response received after ${elapsed}s: Status ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`[Total time: ${(Date.now() - startTime) / 1000}s]`);
    console.log(`[Response size: ${data.length} bytes]`);
    
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        console.log(`[Result] Array with ${parsed.length} items`);
        if (parsed.length === 0) {
          console.log('[ISSUE] Empty array returned - backend API returning []');
          console.log('[Debug] Full response:', data);
        } else {
          parsed.forEach((q, i) => {
            console.log(`  Q${i+1}: ${(q.title || q.description || 'N/A').substring(0, 50)}`);
          });
        }
      } else {
        console.log('[ERROR] Not an array:', typeof parsed);
      }
    } catch (e) {
      console.log('[ERROR] Could not parse JSON:', e.message);
      console.log('[Raw response (first 500 chars)]:', data.substring(0, 500));
    }
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error(`[${new Date().toLocaleTimeString()}] Error:`, e.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.error(`[${new Date().toLocaleTimeString()}] Timeout after 30 seconds`);
  req.destroy();
  process.exit(2);
});

req.write(postData);
req.end();

// Log every 5 seconds
let elapsed = 0;
const interval = setInterval(() => {
  elapsed += 5;
  if (elapsed % 10 === 0) {
    console.log(`[Still waiting... ${elapsed}s elapsed]`);
  }
}, 5000);

setTimeout(() => {
  clearInterval(interval);
}, 35000);
