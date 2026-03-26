const http = require('http');

function makeRequest(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body: body ? JSON.parse(body) : null
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body: body
                    });
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function testOptionB() {
    console.log('🧪 Testing Option B: LLM Code Generation + Execution\n');

    // Test CODING problem generation for Array topic
    console.log('📊 Test 1: Generate CODING problems with code execution');
    console.log('Topic: Array | Type: CODING | Difficulty: Medium\n');

    const generateRequest = {
        hostname: 'localhost',
        port: 8082,
        path: '/api/v1/ai/generate',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const payload = {
        topic: 'Array',
        type: 'CODING',
        difficulty: 'Medium',
        numQuestions: 1,
        numTestCases: 3
    };

    try {
        console.log('📤 Sending request to /api/ai/generate...');
        console.log(`Payload: ${JSON.stringify(payload, null, 2)}\n`);

        const response = await makeRequest(generateRequest, payload);

        if (response.status === 200) {
            console.log('✅ Response received (Status 200)\n');
            
            if (Array.isArray(response.body)) {
                console.log(`Generated ${response.body.length} questions:\n`);

                response.body.forEach((question, idx) => {
                    console.log(`\n📋 Question ${idx + 1}:`);
                    console.log(`  Type: ${question.type}`);
                    console.log(`  Title: ${question.title}`);
                    console.log(`  Description: ${question.description.substring(0, 100)}...`);
                    
                    if (question.testCases && question.testCases.length > 0) {
                        console.log(`  ✓ Test Cases Generated: ${question.testCases.length}`);
                        
                        question.testCases.forEach((tc, tcIdx) => {
                            console.log(`    Test ${tcIdx + 1}:`);
                            console.log(`      Input: ${tc.input.substring(0, 40)}${tc.input.length > 40 ? '...' : ''}`);
                            console.log(`      Output: ${tc.expectedOutput.substring(0, 40)}${tc.expectedOutput.length > 40 ? '...' : ''}`);
                            console.log(`      Is Sample: ${tc.isSample}`);
                        });

                        // Check if test cases look like they were generated from execution
                        const hasGeneratedCases = question.testCases.some(tc => 
                            tc.input && tc.expectedOutput && !tc.expectedOutput.includes('Sample')
                        );
                        
                        if (hasGeneratedCases) {
                            console.log('\n  🎯 Test cases appear to be from code execution (Option B)');
                        } else {
                            console.log('\n  ⚠️ Test cases appear to be hardcoded fallback');
                        }
                    } else {
                        console.log(`  ⚠️ No test cases generated`);
                    }
                });
            } else {
                console.log('Response:', response.body);
            }
        } else {
            console.log(`❌ Error - Status: ${response.status}`);
            console.log('Response:', response.body);
        }
    } catch (error) {
        console.error(`❌ Request failed: ${error.message}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('Test complete!');
}

// Wait a bit for backend to fully start
setTimeout(testOptionB, 3000);
