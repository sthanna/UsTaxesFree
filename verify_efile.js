const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function runTests() {
    try {
        console.log('--- Starting E-File Verification ---');

        // 1. Auth
        const email = `testefile_${Date.now()}@example.com`;
        const password = 'password123';
        // Note: API expects snake_case for registration
        await axios.post(`${API_URL}/auth/register`, { email, password, first_name: 'Efile', last_name: 'User' }).catch(() => { });
        const loginRes = await axios.post(`${API_URL}/auth/login`, { email, password });
        const token = loginRes.data.token;
        const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

        // 2. Create Return
        let ret = await axios.post(`${API_URL}/returns`, { taxYear: 2025, filingStatus: 'SINGLE' }, authHeaders);
        const id = ret.data.id;

        // 3. Add W-2
        await axios.post(`${API_URL}/returns/${id}/w2`, { employer: 'XML Corp', wages: 60000, federalTaxWithheld: 8000 }, authHeaders);

        // 4. Download E-File XML
        console.log('Downloading XML...');
        const xmlRes = await axios.get(`${API_URL}/returns/${id}/efile`, authHeaders);
        const xml = xmlRes.data;

        console.log('XML Received length:', xml.length);
        console.log('Preview:', xml.substring(0, 200));

        // 5. Basic Validations
        if (!xml.includes('<Return xmlns="http://www.irs.gov/efile"')) throw new Error('Root tag missing');
        if (!xml.includes('<WagesSalariesAndTips>60000</WagesSalariesAndTips>')) throw new Error('Wages missing or incorrect');
        if (!xml.includes('<NameLine1>Efile User</NameLine1>')) throw new Error('Name missing');

        console.log('--- Verification Complete: SUCCESS ---');

    } catch (error) {
        console.error('--- Verification Failed ---');
        if (error.response) console.log(error.response.data);
        else console.log(error.message);
        process.exit(1);
    }
}

runTests();
