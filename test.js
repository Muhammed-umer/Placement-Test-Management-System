const http = require('http');

const options = {
  hostname: 'localhost',
  port: 8081,
  path: '/api/v1/assessments',
  method: 'OPTIONS',
  headers: {
    'Origin': 'http://localhost:5173',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'Authorization, Content-Type'
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  if (res.statusCode === 200 || res.statusCode === 204) {
    console.log("Preflight success!");
    // test POST now
    const postOptions = {
      hostname: 'localhost',
      port: 8081,
      path: '/api/v1/assessments',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // 'Authorization': 'Bearer test'
      }
    };
    const req2 = http.request(postOptions, (res2) => {
      console.log(`POST STATUS: ${res2.statusCode}`);
      let body = '';
      res2.on('data', chunk => body += chunk);
      res2.on('end', () => console.log(`POST BODY: ${body}`));
    });
    req2.write(JSON.stringify({ title: "Test" }));
    req2.end();
  }
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
