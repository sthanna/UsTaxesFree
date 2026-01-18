const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function runTests() {
    try {
        console.log('--- Starting Phase 5 Schedule B Verification ---');

        // 1. Authenticate
        const email = `testschb_${Date.now()}@example.com`;
        const password = 'password123';
        await axios.post(`${API_URL}/auth/register`, { email, password, firstName: 'SchB', lastName: 'Tester' }).catch(() => { });
        const loginRes = await axios.post(`${API_URL}/auth/login`, { email, password });
        const token = loginRes.data.token;
        const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

        // 2. Test 2025 Return with Interest/Divs
        // Mock inputs in API: Wages 50k, Int 1000, Div 500
        // Total Income = 51500
        // Std Deduction (Single) = 15000
        // Taxable = 36500

        console.log('2. Testing 2025 Return (With Int/Divs)...');
        const ret = await axios.post(`${API_URL}/returns`, { taxYear: 2025, filingStatus: 'SINGLE' }, authHeaders);
        const res = await axios.post(`${API_URL}/returns/${ret.data.id}/calculate`, {}, authHeaders);

        const lines = res.data.lines;
        const wages = lines.find(l => l.lineNumber === '1z').value;
        const interest = lines.find(l => l.lineNumber === '2b').value;
        const dividends = lines.find(l => l.lineNumber === '3b').value;
        const taxable = lines.find(l => l.lineNumber === '15').value;

        console.log(`   Wages (1z): ${wages} (Expected: 50000)`);
        console.log(`   Interest (2b): ${interest} (Expected: 1000)`);
        console.log(`   Dividends (3b): ${dividends} (Expected: 500)`);
        console.log(`   Taxable Inc (15): ${taxable} (Expected: 36500)`);

        if (wages !== 50000) throw new Error('Wages mismatch');
        if (interest !== 1000) throw new Error('Interest mismatch');
        if (dividends !== 500) throw new Error('Dividends mismatch');
        if (taxable !== 36500) throw new Error('Taxable Income mismatch');

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
