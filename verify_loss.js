const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function runTests() {
    try {
        console.log('--- Starting Schedule D Loss Verification ---');

        // 1. Authenticate
        const email = `testloss_${Date.now()}@example.com`;
        const password = 'password123';
        await axios.post(`${API_URL}/auth/register`, { email, password, firstName: 'Loss', lastName: 'User' }).catch(() => { });
        const loginRes = await axios.post(`${API_URL}/auth/login`, { email, password });
        const token = loginRes.data.token;
        const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

        // Test Case: Net Loss > 3000 (Limitation)
        console.log('Creating Return...');
        const ret = await axios.post(`${API_URL}/returns`, { taxYear: 2025, filingStatus: 'SINGLE' }, authHeaders);
        const id = ret.data.id;

        console.log('Adding W2...');
        await axios.post(`${API_URL}/returns/${id}/w2`, { employer: 'Job', wages: 50000, federalTaxWithheld: 5000 }, authHeaders);

        console.log('Adding 1099-B (Loss)...');
        try {
            await axios.post(`${API_URL}/returns/${id}/1099-b`, { description: 'Bad Stock', proceeds: 0, costBasis: 10000, isLongTerm: false }, authHeaders); // -10000
            console.log('1099-B Added Successfully');
        } catch (e) {
            console.log('1099-B Create Failed');
            throw e;
        }

        console.log('Calculating...');
        const calc = await axios.post(`${API_URL}/returns/${id}/calculate`, {}, authHeaders);
        const lines = calc.data.lines;
        const capGain = lines.find(l => l.lineNumber === '7' && l.form === '1040').value;

        console.log(`Cap Gain (1040 Line 7): ${capGain} (Exp: -3000)`);
        if (capGain !== -3000) throw new Error('Loss Limitation Failed');

        console.log('--- Verification Complete: SUCCESS ---');

    } catch (error) {
        console.error('--- Verification Failed ---');
        if (error.response) {
            console.log(JSON.stringify(error.response.data));
        } else {
            console.log(error.message);
        }
        process.exit(1);
    }
}

runTests();
