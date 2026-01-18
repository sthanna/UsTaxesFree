const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
let token = '';
let userId = '';

async function runTests() {
    try {
        console.log('--- Starting Verification ---');

        // 1. Register User
        const email = `testuser_${Date.now()}@example.com`;
        const password = 'password123';
        console.log(`1. Registering user: ${email}`);
        try {
            const regRes = await axios.post(`${API_URL}/auth/register`, {
                email,
                password,
                firstName: 'Test',
                lastName: 'User',
            });
            console.log('   Register Success:', regRes.status);
        } catch (e) {
            console.error('   Register Failed:', e.response?.data || e.message);
            // If register fails, try login (maybe user exists from previous run)
        }

        // 2. Login User
        console.log(`2. Logging in`);
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email,
            password,
        });
        token = loginRes.data.token;
        userId = loginRes.data.user.id;
        console.log('   Login Success. Token received.');

        const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

        // 3. Create Return
        console.log(`3. Creating Tax Return for 2025`);
        const createRes = await axios.post(
            `${API_URL}/returns`,
            { taxYear: 2025, filingStatus: 'SINGLE' },
            authHeaders
        );
        console.log('   Create Return Success:', createRes.data.id);
        const returnId = createRes.data.id;

        // 4. List Returns
        console.log(`4. Listing Returns`);
        const listRes = await axios.get(`${API_URL}/returns`, authHeaders);
        const found = listRes.data.find((r) => r.id === returnId);
        if (found) {
            console.log('   List Returns Success: Found created return.');
        } else {
            console.error('   List Returns Failed: Return not found.');
        }

        // 5. Get Specific Return
        console.log(`5. Getting Return Details: ${returnId}`);
        const getRes = await axios.get(`${API_URL}/returns/${returnId}`, authHeaders);
        if (getRes.data.id === returnId) {
            console.log('   Get Return Success:', getRes.data.filing_status);
        } else {
            console.error('   Get Return Failed');
        }

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
