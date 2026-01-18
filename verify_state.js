const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function runTests() {
    try {
        console.log('--- Starting Phase 6 State Verification ---');

        // 1. Authenticate
        const email = `teststate_${Date.now()}@example.com`;
        const password = 'password123';
        await axios.post(`${API_URL}/auth/register`, { email, password, firstName: 'State', lastName: 'Tester' }).catch(() => { });
        const loginRes = await axios.post(`${API_URL}/auth/login`, { email, password });
        const token = loginRes.data.token;
        const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

        // 2. Test 2025 Return with State Logic triggered
        // Federal context: Wages 50k, Int 1000, Div 500 = 51500 AGI.
        // NY Logic:
        // - Starts with 51500
        // - Std Ded: 8000
        // - Taxable: 43500
        // - Tax (5%): 2175

        console.log('2. Testing Return with NY State...');
        const ret = await axios.post(`${API_URL}/returns`, { taxYear: 2025, filingStatus: 'SINGLE' }, authHeaders);
        const res = await axios.post(`${API_URL}/returns/${ret.data.id}/calculate`, {}, authHeaders);

        const stateRes = res.data.stateResult;
        if (!stateRes) throw new Error('State Result missing');

        const nyAGI = stateRes.lines.find(l => l.lineNumber === '19').value;
        const nyDed = stateRes.lines.find(l => l.lineNumber === '34').value;
        const nyTaxable = stateRes.lines.find(l => l.lineNumber === '37').value;
        const nyTax = stateRes.lines.find(l => l.lineNumber === '39').value;

        console.log(`State: ${stateRes.state}`);
        console.log(`NY AGI (19): ${nyAGI} (Expected: 51500)`);
        console.log(`NY Ded (34): ${nyDed} (Expected: 8000)`);
        console.log(`NY Taxable (37): ${nyTaxable} (Expected: 43500)`);
        console.log(`NY Tax (39): ${nyTax} (Expected: 2175)`);

        if (nyAGI !== 51500) throw new Error('NY AGI Mismatch');
        if (nyDed !== 8000) throw new Error('NY Ded Mismatch');
        if (nyTaxable !== 43500) throw new Error('NY Taxable Mismatch');

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
