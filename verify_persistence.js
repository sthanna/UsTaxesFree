const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function runTests() {
    try {
        console.log('--- Starting Phase 7 Persistence Verification ---');

        // 1. Authenticate
        const email = `testpersist_${Date.now()}@example.com`;
        const password = 'password123';
        await axios.post(`${API_URL}/auth/register`, { email, password, firstName: 'Persist', lastName: 'User' }).catch(() => { });
        const loginRes = await axios.post(`${API_URL}/auth/login`, { email, password });
        const token = loginRes.data.token;
        const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

        // 2. Create Return
        const ret = await axios.post(`${API_URL}/returns`, { taxYear: 2025, filingStatus: 'SINGLE' }, authHeaders);
        const returnId = ret.data.id;
        console.log('Created Return ID:', returnId);

        // 3. Add Data (W-2, 1099-INT, 1099-DIV) via API
        console.log('Adding Forms...');
        await axios.post(`${API_URL}/returns/${returnId}/w2`, {
            employer: 'Tech Co', wages: 80000, federalTaxWithheld: 15000
        }, authHeaders);

        await axios.post(`${API_URL}/returns/${returnId}/1099-int`, {
            payer: 'Bank of America', amount: 200
        }, authHeaders);

        await axios.post(`${API_URL}/returns/${returnId}/1099-div`, {
            payer: 'Vanguard', amount: 300
        }, authHeaders);

        // 4. Calculate
        console.log('Triggering Calculation...');
        const calcRes = await axios.post(`${API_URL}/returns/${returnId}/calculate`, {}, authHeaders);
        const result = calcRes.data;

        // 5. Verify Logic (Values should match DB inputs)
        // Wages: 80,000
        // Interest: 200
        // Divs: 300
        // Total Income: 80,500
        const wages = result.lines.find(l => l.lineNumber === '1z').value;
        const interest = result.lines.find(l => l.lineNumber === '2b').value;
        const dividends = result.lines.find(l => l.lineNumber === '3b').value;

        console.log(`Wages: ${wages} (Exp: 80000)`);
        console.log(`Interest: ${interest} (Exp: 200)`);
        console.log(`Dividends: ${dividends} (Exp: 300)`);

        if (wages !== 80000) throw new Error('Wages not persisted');
        if (interest !== 200) throw new Error('Interest not persisted');
        if (dividends !== 300) throw new Error('Dividends not persisted');

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
