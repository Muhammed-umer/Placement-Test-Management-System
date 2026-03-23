const http = require('http');
const data = JSON.stringify({
  source_code: "print('Hello')",
  language_id: 71,
  stdin: ""
});

const req = http.request({
  hostname: 'localhost',
  port: 8081,
  path: '/api/v1/code/run',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Response:', res.statusCode, body));
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(data);
req.end();
