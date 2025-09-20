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
    // Testing Eden Parfum API endpoints

    const endpoints = [
        '/api/health',
        '/api/v2/perfumes?limit=5',
        '/api/v2/brands?limit=5',
        '/api/v2/photos/stats'
    ];

    const results = [];
    for (const endpoint of endpoints) {
        try {
            // Testing endpoint
            const result = await testEndpoint(endpoint);
            results.push({
                endpoint,
                status: result.status,
                success: true,
                data: result.data
            });
        } catch (error) {
            results.push({
                endpoint,
                success: false,
                error: error.message
            });
        }
    }

    // Test completed
    return results;
}

// Only run test if this file is executed directly
if (require.main === module) {
    runTests().then(results => {
        const failures = results.filter(r => !r.success);
        process.exit(failures.length > 0 ? 1 : 0);
    });
}

module.exports = runTests;