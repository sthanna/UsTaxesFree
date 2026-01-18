const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function runTests() {
    try {
        console.log('--- Starting PA/NJ State Verification ---');

        const email = `teststates_${Date.now()}@example.com`;
        const password = 'password123';
        await axios.post(`${API_URL}/auth/register`, { email, password, firstName: 'State', lastName: 'Tester' }).catch(() => { });
        const loginRes = await axios.post(`${API_URL}/auth/login`, { email, password });
        const token = loginRes.data.token;
        const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

        // --- Test PA (Flat Tax, No Loss Offset) ---
        console.log('\n--- Testing PA (Flat 3.07%) ---');
        let ret = await axios.post(`${API_URL}/returns`, { taxYear: 2025, filingStatus: 'SINGLE' }, authHeaders);
        let id = ret.data.id;
        // Note: We need to set residentState on return or engine input. 
        // Since API doesn't support updating state yet, we assume we might need to mock or add input support?
        // Wait, the plan said "Update CalculationEngine to use dynamic state selection from INPUT".
        // But `POST /calculate` usually builds input from DB. 
        // Does the DB `returns` table have `resident_state`? Not yet.
        // WORKAROUND: For this test, valid `input` logic implies we need a way to pass it. 
        // BUT the current implementation of `calculate.ts` reads from DB. 
        // I need to update `calculate.ts` to accept `residentState` in body OR default to NY.
        // Update: I haven't updated `calculate.ts` API to accept `residentState`.
        // I will do that in the next step. For now, let's write the test assuming I WILL add it.

        await axios.post(`${API_URL}/returns/${id}/w2`, { employer: 'PA Job', wages: 100000, federalTaxWithheld: 10000 }, authHeaders);

        // Call Calculate with state override (I will implement this next)
        let calc = await axios.post(`${API_URL}/returns/${id}/calculate`, { residentState: 'PA' }, authHeaders);
        let lines = calc.data.lines;
        const stateResult = calc.data.stateResult;
        console.log('State Result:', JSON.stringify(stateResult));

        let paTax = stateResult?.totalTax;
        console.log(`PA Tax (3.07% of 100k): ${paTax} (Exp: 3070)`);
        if (Math.abs(paTax - 3070) > 0.05) throw new Error('PA Tax Failed');

        // --- Test NJ (Progressive) ---
        try {
            console.log('\n--- Testing NJ (Progressive) ---');
            ret = await axios.post(`${API_URL}/returns`, { taxYear: 2025, filingStatus: 'SINGLE' }, authHeaders);
            id = ret.data.id;

            await axios.post(`${API_URL}/returns/${id}/w2`, { employer: 'NJ Job', wages: 50000, federalTaxWithheld: 5000 }, authHeaders);
            calc = await axios.post(`${API_URL}/returns/${id}/calculate`, { residentState: 'NJ' }, authHeaders);
            lines = calc.data.lines;
            const njResult = calc.data.stateResult;
            console.log('NJ Result:', JSON.stringify(njResult));

            let njTax = njResult?.totalTax;
            console.log(`NJ Tax: ${njTax} (Exp: 1214.75)`);

            if (typeof njTax !== 'number' || Math.abs(njTax - 1214.75) > 0.05) throw new Error('NJ Tax Failed');
        } catch (e) {
            console.log('NJ TEST ERROR:', e.message);
            throw e;
        }

        console.log('--- Verification Complete: SUCCESS ---');

    } catch (error) {
        console.error('--- Verification Failed ---');
        if (error.response) console.log(error.response.data);
        else console.log(error.message);
        process.exit(1);
    }
}

runTests();
