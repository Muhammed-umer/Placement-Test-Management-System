const jsdom = require('jsdom');
const { JSDOM } = require('jsdom');
const https = require('https');

// Test with a specific known problem
const testUrl = 'https://codeforces.com/contest/2182/problem/A';

https.get(testUrl, (res) => {
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    try {
      const dom = new JSDOM(html);
      const doc = dom.window.document;
      
      const problemStatement = doc.querySelector('.problem-statement');
      if (problemStatement) {
        const allDivs = problemStatement.querySelectorAll('div, p');
        console.log('\n=== Problem Statement Elements ===');
        console.log('Total elements:', allDivs.length);
        console.log('\nFirst 15 elements:');
        
        for (let i = 0; i < Math.min(15, allDivs.length); i++) {
          const text = allDivs[i].textContent.trim();
          if (text.length > 0 && text.length < 200) {
            console.log(`[${i}] ${text.substring(0, 100)}`);
          }
        }
      }
    } catch (e) {
      console.error('Error:', e.message);
    }
  });
}).on('error', e => console.error('Request error:', e.message));
