const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function runTests() {
    try {
        console.log('--- Starting Phase 4 Multi-Year Verification ---');

        // 1. Authenticate
        const email = `testmulti_${Date.now()}@example.com`;
        const password = 'password123';
        await axios.post(`${API_URL}/auth/register`, { email, password, firstName: 'Multi', lastName: 'Year' }).catch(() => { });
        const loginRes = await axios.post(`${API_URL}/auth/login`, { email, password });
        const token = loginRes.data.token;
        const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

        // 2. Test 2025 Return (Standard Deduction ~15000/30000 example)
        console.log('2. Testing 2025 Return...');
        const ret2025 = await axios.post(`${API_URL}/returns`, { taxYear: 2025, filingStatus: 'SINGLE' }, authHeaders);
        const res2025 = await axios.post(`${API_URL}/returns/${ret2025.data.id}/calculate`, {}, authHeaders);

        const ded2025 = res2025.data.lines.find(l => l.lineNumber === '12').value;
        console.log(`   2025 Std Deduction: ${ded2025} (Expected: 15000)`);
        if (ded2025 !== 15000) throw new Error('2025 Logic Failed');

        // 3. Test 2024 Return (Standard Deduction 14600)
        console.log('3. Testing 2024 Return...');
        const ret2024 = await axios.post(`${API_URL}/returns`, { taxYear: 2024, filingStatus: 'SINGLE' }, authHeaders);
        const res2024 = await axios.post(`${API_URL}/returns/${ret2024.data.id}/calculate`, {}, authHeaders);

        const ded2024 = res2024.data.lines.find(l => l.lineNumber === '12').value;
        console.log(`   2024 Std Deduction: ${ded2024} (Expected: 14600)`);
        if (ded2024 !== 14600) throw new Error('2024 Logic Failed');

        console.log('--- Verification Complete: SUCCESS ---');

    } catch (error) {
        console.error('--- Verification Failed ---');
        if (error.response) {
            console.log(error.response.data);
        } else {
            console.log(error.message);
        }
        process.exit(1);
    }
}

runTests();
