const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function runTests() {
    try {
        console.log('--- Starting NJ Verification Only ---');

        const email = `testnj_${Date.now()}@example.com`;
        const password = 'password123';
        await axios.post(`${API_URL}/auth/register`, { email, password, firstName: 'NJ', lastName: 'Tester' }).catch(() => { });
        const loginRes = await axios.post(`${API_URL}/auth/login`, { email, password });
        const token = loginRes.data.token;
        const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

        // --- Test NJ (Progressive) ---
        console.log('\n--- Testing NJ (Progressive) ---');
        const ret = await axios.post(`${API_URL}/returns`, { taxYear: 2025, filingStatus: 'SINGLE' }, authHeaders);
        const id = ret.data.id;

        console.log('Adding W2...');
        await axios.post(`${API_URL}/returns/${id}/w2`, { employer: 'NJ Job', wages: 50000, federalTaxWithheld: 5000 }, authHeaders);

        console.log('Calculating...');
        const calc = await axios.post(`${API_URL}/returns/${id}/calculate`, { residentState: 'NJ' }, authHeaders);
        const lines = calc.data.lines;
        const njResult = calc.data.stateResult;
        console.log('NJ Result:', JSON.stringify(njResult, null, 2));

        let njTax = njResult?.totalTax;
        console.log(`NJ Tax: ${njTax} (Exp: 1214.75)`);

        if (typeof njTax !== 'number' || Math.abs(njTax - 1214.75) > 0.05) throw new Error('NJ Tax Failed');

        console.log('--- Verification Complete: SUCCESS ---');

    } catch (error) {
        console.error('--- Verification Failed ---');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log(error.message);
        }
        process.exit(1);
    }
}

runTests();
