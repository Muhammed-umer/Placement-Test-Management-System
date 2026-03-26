// Test basic connectivity first
const http = require('http');

console.log('[Test] Attempting connection to backend...');
console.log('[Test] Time:', new Date().toLocaleTimeString());

const options = {
  hostname: 'localhost',
  port: 8081,
  path: '/api/v1/auth/login',  // Try a simpler endpoint first
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 5000  // 5 second timeout
};

const req = http.request(options, (res) => {
  console.log(`[Test] GOT RESPONSE - Status: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('[Test] Response received');
    console.log('[Test] Data length:', data.length);
    console.log('[Test] First 500 chars:', data.substring(0, 500));
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error('[Test-ERROR] Connection error:', e.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('[Test-TIMEOUT] Request timed out after 5 seconds');
  req.destroy();
  process.exit(2);
});

req.write(JSON.stringify({username: 'test', password: 'test'}));
req.end();

console.log('[Test] Request sent, waiting for response (max 5 seconds)...');

// Also log if process is still hanging after 10 seconds
setTimeout(() => {
  console.error('[Test-HUNG] Process appears to be hung after 10 seconds');
  process.exit(3);
}, 10000);
