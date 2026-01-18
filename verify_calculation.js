const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function runTests() {
    try {
        console.log('--- Starting Phase 3 Calculation Verification ---');

        // 1. Authenticate
        const email = `testcalc_${Date.now()}@example.com`;
        const password = 'password123';
        await axios.post(`${API_URL}/auth/register`, { email, password, firstName: 'Calc', lastName: 'Tester' }).catch(() => { });
        const loginRes = await axios.post(`${API_URL}/auth/login`, { email, password });
        const token = loginRes.data.token;
        const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
        console.log('1. Auth Success');

        // 2. Create Return (Single)
        const createRes = await axios.post(`${API_URL}/returns`, { taxYear: 2025, filingStatus: 'SINGLE' }, authHeaders);
        const returnId = createRes.data.id;
        console.log(`2. Return Created: ID ${returnId}`);

        // 3. Trigger Calculation
        console.log('3. Triggering Calculation...');
        const calcRes = await axios.post(`${API_URL}/returns/${returnId}/calculate`, {}, authHeaders);
        const result = calcRes.data;

        // 4. Verify Results (Wages $50k mock)
        // - Wages: 50,000
        // - Std Ded: 14,600
        // - Taxable: 35,400
        // - Tax (Est): ~3,540 + 1,160 = ~4,000 range.

        console.log('--- Calculation Results ---');
        console.log('Tax Year:', result.taxYear);
        console.log('Filing Status:', result.filingStatus);

        const wages = result.lines.find(l => l.lineNumber === '1z').value;
        const stdDed = result.lines.find(l => l.lineNumber === '12').value;
        const taxable = result.lines.find(l => l.lineNumber === '15').value;
        const tax = result.lines.find(l => l.lineNumber === '16').value;
        const owed = result.amountOwed;
        const refund = result.refund;

        console.log(`Wages (1z): ${wages} (Expected: 50000)`);
        console.log(`Std Deduction (12): ${stdDed} (Expected: 14600)`);
        console.log(`Taxable Income (15): ${taxable} (Expected: 35400)`);
        console.log(`Tax (16): ${tax}`);

        if (wages !== 50000) throw new Error('Wages mismatch');
        if (stdDed !== 14600) throw new Error('Std Deduction mismatch');
        if (taxable !== 35400) throw new Error('Taxable Income mismatch');

        console.log('--- Verification Complete: SUCCESS ---');

    } catch (error) {
        console.error('--- Verification Failed ---');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error(error.message);
        }
        process.exit(1);
    }
}

runTests();
