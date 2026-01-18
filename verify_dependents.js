const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function runTest() {
    try {
        console.log('--- Starting Dependents & Credits Verification ---');

        // 1. Register User
        const email = `test_dep_${Date.now()}@example.com`;
        const password = 'Password123!';
        console.log(`Registering user: ${email}`);

        await axios.post(`${API_URL}/auth/register`, {
            email,
            password,
            first_name: 'John',
            last_name: 'Doe'
        });

        const loginRes = await axios.post(`${API_URL}/auth/login`, { email, password });
        const token = loginRes.data.token;
        console.log('Logged in.');

        // 2. Create Return
        const returnRes = await axios.post(`${API_URL}/returns`,
            { taxYear: 2025, filingStatus: 'MARRIED_JOINT' },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const returnId = returnRes.data.id;
        console.log(`Created Return ID: ${returnId}`);

        // 3. Add W-2 Income (Need some tax liability to offset credits)
        await axios.post(`${API_URL}/returns/${returnId}/w2`, {
            employer: 'Tech Corp',
            wages: 85000,
            federalTaxWithheld: 8000,
            ssn: '000-00-0000',
            employerEin: '12-3456789',
            address: '123 Tech Ln',
            city: 'Tech City',
            state: 'CA',
            zip: '90001'
        }, { headers: { Authorization: `Bearer ${token}` } });
        console.log('Added W-2 Income: $85,000');

        // 4. Add Dependents
        // Child 1: Born 2020 (Age 5 in 2025) -> $2,000 CTC
        await axios.post(`${API_URL}/returns/${returnId}/dependents`, {
            first_name: 'Junior',
            last_name: 'Doe',
            ssn: '111-00-1111',
            date_of_birth: '2020-05-15',
            relationship: 'Child',
            months_lived_with: 12
        }, { headers: { Authorization: `Bearer ${token}` } });

        // Uncle: Born 1980 -> $500 Credit for Other Dependents
        await axios.post(`${API_URL}/returns/${returnId}/dependents`, {
            first_name: 'Uncle',
            last_name: 'Bob',
            ssn: '222-00-2222',
            date_of_birth: '1980-01-01',
            relationship: 'Other Relative',
            months_lived_with: 12
        }, { headers: { Authorization: `Bearer ${token}` } });

        console.log('Added 2 Dependents (Child < 17, and Other Relative)');

        // 5. Trigger Calculation
        const calcRes = await axios.post(`${API_URL}/returns/${returnId}/calculate`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const result = calcRes.data;
        const lines = result.lines;

        // 6. Verify CTC (Line 19)
        const line19 = lines.find(l => l.lineNumber === '19' && l.form === '1040');
        console.log('Line 19 (CTC/ODC):', line19 ? line19.value : 'Not Found');

        const expectedCredit = 2000 + 500;
        if (line19 && line19.value === expectedCredit) {
            console.log('SUCCESS: CTC calculation correct ($2500).');
        } else {
            console.error(`FAILURE: Expected $${expectedCredit}, got ${line19 ? line19.value : 'undefined'}`);
        }

        // 7. Verify Tax (Line 16) vs Total Tax (Line 24)
        const line16 = lines.find(l => l.lineNumber === '16' && l.form === '1040'); // Tax before credits
        const line24 = lines.find(l => l.lineNumber === '24' && l.form === '1040'); // Tax after credits

        console.log(`Tax (Line 16): ${line16.value}`);
        console.log(`Total Tax (Line 24): ${line24.value}`);

        let output = lines.map(l => `${l.lineNumber} ${l.description}: ${l.value}`).join('\n');
        output += `\nCTC Line 19 Expected: ${expectedCredit}. Actual: ${line19 ? line19.value : 'N/A'}`;
        output += `\nTax Line 16: ${line16 ? line16.value : 'N/A'}`;
        output += `\nTotal Tax Line 24: ${line24 ? line24.value : 'N/A'}`;

        require('fs').writeFileSync('verify_dependents_output.txt', output);
        console.log('Done. Check verify_dependents_output.txt');

        if (line24.value === Math.max(0, line16.value - expectedCredit)) {
            console.log('SUCCESS: Total Tax correctly reduced by credits.');
        } else {
            console.error('FAILURE: Tax reduction incorrect.');
        }

    } catch (error) {
        const errMsg = error.response ? JSON.stringify(error.response.data) : error.message;
        console.error('Test Failed:', errMsg);
        require('fs').writeFileSync('verify_error.log', errMsg);
    }
}

runTest();
