// Test AI API to diagnose empty array issue
const http = require('http');

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
  }
};

console.log('[Test] Calling AI API at http://localhost:8081/api/v1/ai/generate');
console.log('[Test] Request body:', postData);

const req = http.request(options, (res) => {
  console.log(`[Test] Response status: ${res.statusCode}`);
  console.log(`[Test] Response headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('[Test] Response body received, length:', data.length);
    try {
      const parsed = JSON.parse(data);
      console.log('[Test] Parsed JSON:', JSON.stringify(parsed, null, 2));
      
      if (Array.isArray(parsed)) {
        console.log(`[Test+SUCCESS] Got array with ${parsed.length} items`);
        if (parsed.length === 0) {
          console.log('[Test-EMPTY] Array is empty - backend is returning no questions');
        } else {
          console.log('[Test+OK] Questions returned!');
          parsed.forEach((q, i) => {
            console.log(`  [Q${i+1}] ${q.title || q.description || 'No title/description'}`);
            if (q.options) {
              console.log(`       Options: ${q.options.length} options`);
            }
          });
        }
      } else {
        console.log('[Test-ERROR] Response is not an array:', typeof parsed);
      }
    } catch (e) {
      console.log('[Test-ERROR] Failed to parse JSON:', e.message);
      console.log('[Test-RAW] Raw response:', data.substring(0, 500));
    }
  });
});

req.on('error', (e) => {
  console.error('[Test-ERROR] Request failed:', e.message);
});

req.write(postData);
req.end();

console.log('[Test] Request sent, waiting for response...');
