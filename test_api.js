// Quick API test script
const http = require('http');

function testEndpoint(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'GET',
            timeout: 5000
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(data);
                    resolve({ status: res.statusCode, data: parsedData });
                } catch (err) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.end();
    });
}

async function runTests() {
    console.log('🧪 Testing Eden Parfum API endpoints...\n');

    const endpoints = [
        '/api/health',
        '/api/v2/perfumes?limit=5',
        '/api/v2/brands?limit=5',
        '/api/v2/photos/stats'
    ];

    for (const endpoint of endpoints) {
        try {
            console.log(`Testing ${endpoint}...`);
            const result = await testEndpoint(endpoint);
            console.log(`✅ Status: ${result.status}`);
            if (typeof result.data === 'object') {
                console.log(`📊 Response:`, JSON.stringify(result.data, null, 2));
            } else {
                console.log(`📊 Response:`, result.data.substring(0, 200) + '...');
            }
            console.log('');
        } catch (error) {
            console.log(`❌ Error: ${error.message}\n`);
        }
    }

    console.log('🏁 Test completed!');
}

runTests();