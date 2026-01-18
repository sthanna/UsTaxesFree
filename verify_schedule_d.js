const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function runTests() {
    try {
        console.log('--- Starting Phase 8 Schedule D Verification ---');

        // 1. Authenticate
        const email = `testschd_${Date.now()}@example.com`;
        const password = 'password123';
        await axios.post(`${API_URL}/auth/register`, { email, password, firstName: 'Cap', lastName: 'Gain' }).catch(() => { });
        const loginRes = await axios.post(`${API_URL}/auth/login`, { email, password });
        const token = loginRes.data.token;
        const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

        // Test Case 1: Net Gain
        console.log('Test 1: Net Gain ($5000 Gain)');
        let ret = await axios.post(`${API_URL}/returns`, { taxYear: 2025, filingStatus: 'SINGLE' }, authHeaders);
        let id = ret.data.id;
        await axios.post(`${API_URL}/returns/${id}/w2`, { employer: 'Job', wages: 50000, federalTaxWithheld: 5000 }, authHeaders);
        await axios.post(`${API_URL}/returns/${id}/1099-b`, { description: 'Stock A', proceeds: 10000, costBasis: 5000, isLongTerm: false }, authHeaders); // +5000

        let calc = await axios.post(`${API_URL}/returns/${id}/calculate`, {}, authHeaders);
        let lines = calc.data.lines;
        let capGain = lines.find(l => l.lineNumber === '7').value;
        let totalIncome = lines.find(l => l.lineNumber === '15')?.value || lines.find(l => l.lineNumber === '1z').value + capGain; // Approx check or finding line 9/Total Income if id exists? 
        // Line 15 is Taxable Income. 
        // Line 1z (50k) + 7 (5k) = 55k Total. Std Ded 15k. Taxable = 40k.

        console.log(`Cap Gain (7): ${capGain} (Exp: 5000)`);
        if (capGain !== 5000) throw new Error('Cap Gain Mismatch');

        // Test Case 2: Net Loss > 3000 (Limitation)
        console.log('Test 2: Loss Limitation ($10,000 Loss)');
        ret = await axios.post(`${API_URL}/returns`, { taxYear: 2025, filingStatus: 'SINGLE' }, authHeaders);
        id = ret.data.id;
        console.log('Test 2: Return Created', id);

        await axios.post(`${API_URL}/returns/${id}/w2`, { employer: 'Job', wages: 50000, federalTaxWithheld: 5000 }, authHeaders);
        console.log('Test 2: W2 Added');

        try {
            await axios.post(`${API_URL}/returns/${id}/1099-b`, { description: 'Bad Stock', proceeds: 0, costBasis: 10000, isLongTerm: false }, authHeaders); // -10000
            console.log('Test 2: 1099-B Added');
        } catch (e) { console.log('Test 2: 1099-B Failed'); throw e; }

        console.log('Test 2: Calculating...');
        calc = await axios.post(`${API_URL}/returns/${id}/calculate`, {}, authHeaders);
        lines = calc.data.lines;
        capGain = lines.find(l => l.lineNumber === '7').value;
        let realLoss = -3000;

        console.log(`Cap Gain (7): ${capGain} (Exp: -3000)`);
        if (capGain !== -3000) throw new Error('Loss Limitation Failed');

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
