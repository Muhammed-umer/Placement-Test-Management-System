// Test AI API on port 8083 (new with fixes)
const http = require('http');

console.log('[Test] Testing /api/v1/ai/generate on port 8083 (with fixes)');
console.log(`[${new Date().toLocaleTimeString()}] Sending request...`);

const postData = JSON.stringify({
  topic: 'Array',
  numQuestions: 2,
  difficulty: 'Easy',
  type: 'QUIZ',
  context: ''
});

const startTime = Date.now();

const options = {
  hostname: 'localhost',
  port: 8083,
  path: '/api/v1/ai/generate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  },
  timeout: 40000
};

const req = http.request(options, (res) => {
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`[${new Date().toLocaleTimeString()}] Response Status: ${res.statusCode} (after ${elapsed}s)`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`[Total: ${((Date.now() - startTime) / 1000).toFixed(2)}s] Response size: ${data.length} bytes`);
    
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        if (parsed.length === 0) {
          console.log('[✗] STILL EMPTY - Got array with 0 items');
          console.log('Full response:', data);
        } else {
          console.log(`[✓] SUCCESS - Got ${parsed.length} questions!`);
          parsed.forEach((q, i) => {
            console.log(`  Q${i+1}: ${(q.title || q.description || 'N/A').substring(0, 60)}`);
            if (q.options) {
              console.log(`       - ${q.options.length} options`);
            }
            if (q.correctAnswer) {
              console.log(`       - Answer: ${q.correctAnswer.substring(0, 40)}`);
            }
          });
        }
      } else {
        console.log('[✗] NOT AN ARRAY:', typeof parsed);
      }
    } catch (e) {
      console.log('[ERROR] Parse failed:', e.message);
      console.log('Raw:', data.substring(0, 300));
    }
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error(`[${new Date().toLocaleTimeString()}] Error: ${e.message}`);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('[TIMEOUT] After 40 seconds');
  req.destroy();
  process.exit(2);
});

req.write(postData);
req.end();

// Log status every 10 seconds
const statusInterval = setInterval(() => {
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
  console.log(`[Status] Still waiting... ${elapsed}s`);
}, 10000);

setTimeout(() => clearInterval(statusInterval), 45000);
