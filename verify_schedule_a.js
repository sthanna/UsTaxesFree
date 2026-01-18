const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
const EMAIL = `test_scha_${Date.now()}@example.com`;
const PASSWORD = 'password123';

async function runTest() {
    try {
        console.log('--- Starting Schedule A Verification ---');

        // 1. Register
        console.log(`Registering user: ${EMAIL}`);
        const authRes = await axios.post(`${API_URL}/auth/register`, {
            email: EMAIL,
            password: PASSWORD,
            first_name: 'SchA',
            last_name: 'Tester'
        });
        const token = authRes.data.token;
        console.log('Logged in.');

        // 2. Create Return
        const returnRes = await axios.post(`${API_URL}/returns`,
            { taxYear: 2025, filingStatus: 'SINGLE' }, // Standard Deduction: 15,000
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const returnId = returnRes.data.id;
        console.log(`Created Return ID: ${returnId}`);

        // 3. Add High Income W-2
        await axios.post(`${API_URL}/returns/${returnId}/w2`, {
            employer: 'Tech Corp',
            wages: 100000,
            federalTaxWithheld: 20000
        }, { headers: { Authorization: `Bearer ${token}` } });
        console.log('Added W-2 ($100k)');

        // 4. Initial Calc (Should use Standard Deduction 15000)
        let calcRes = await axios.post(`${API_URL}/returns/${returnId}/calculate`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        let line12 = calcRes.data.lines.find(l => l.lineNumber === '12' && l.form === '1040');
        console.log(`Initial Line 12 (Standard): ${line12.value}`);
        if (line12.value !== 15000) throw new Error(`Expected Standard Deduction 15000, got ${line12.value}`);

        // 5. Add Schedule A Deductions (Total > 15000)
        // SALT: 12000 (Cap 10000)
        // Mortgage: 6000
        // Charity: 1000
        // Total Expected: 10000 + 6000 + 1000 = 17000
        await axios.post(`${API_URL}/returns/${returnId}/schedule-a`, {
            state_local_income_taxes: 12000,
            real_estate_taxes: 0,
            personal_property_taxes: 0,
            mortgage_interest: 6000,
            charitable_contributions_cash: 1000,
            medical_expenses: 0
        }, { headers: { Authorization: `Bearer ${token}` } });
        console.log('Added Schedule A (SALT $12k, Mort $6k, Charity $1k)');

        // 6. Recalculate (Should switch to Itemized 17000)
        calcRes = await axios.post(`${API_URL}/returns/${returnId}/calculate`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });

        line12 = calcRes.data.lines.find(l => l.lineNumber === '12' && l.form === '1040');
        const schALine17 = calcRes.data.lines.find(l => l.lineNumber === '17' && l.form === 'Schedule A');

        console.log(`Itemized Total (Line 17): ${schALine17?.value}`);
        console.log(`Final Line 12: ${line12.value} (${line12.description})`);

        if (schALine17.value !== 17000) throw new Error(`Expected Itemized Total 17000, got ${schALine17.value} (SALT cap failed?)`);
        if (line12.value !== 17000) throw new Error(`Expected Line 12 to be 17000, got ${line12.value}`);
        if (!line12.description.includes('Itemized')) throw new Error('Line 12 description should indicate Itemized');

        console.log('SUCCESS: Schedule A logic verified (SALT Cap + Switch to Itemized works).');

    } catch (error) {
        console.error('--- FAILURE DETAILS ---');
        console.error('Failed at step:', error.config ? `${error.config.method.toUpperCase()} ${error.config.url}` : 'Unknown');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error Message:', error.message);
        }
        process.exit(1);
    }
}

runTest();
