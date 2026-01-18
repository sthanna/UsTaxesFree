const http = require('http');

const check = (path) => {
    return new Promise((resolve, reject) => {
        http.get(`http://localhost:3000${path}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, data }));
        }).on('error', reject);
    });
};

(async () => {
    try {
        const health = await check('/health');
        console.log('Health:', health.statusCode, health.data);

        const ready = await check('/ready');
        console.log('Ready:', ready.statusCode, ready.data);
    } catch (e) {
        console.error('Error:', e.message);
    }
})();
