const http = require('http');

const data = JSON.stringify({
  topic: 'Array',
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
      const problems = Array.isArray(parsed) ? parsed : [parsed];
      
      const totals = problems.reduce((acc, p) => {
        const count = p.testCases ? p.testCases.length : 0;
        return {
          total: acc.total + count,
          problems: acc.problems + 1,
          cases: [...acc.cases, count]
        };
      }, { total: 0, problems: 0, cases: [] });
      
      console.log('Total test cases extracted:', totals.total);
      console.log('Total problems:', totals.problems);
      console.log('Test cases per problem:', totals.cases.join(', '));
      console.log('Average:', (totals.total / totals.problems).toFixed(2));
      
    } catch (e) {
      console.error('Parse error:', e.message);
    }
  });
});

req.write(data);
req.end();
