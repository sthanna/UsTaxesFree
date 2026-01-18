const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
const EMAIL = `test_pay_${Date.now()}@example.com`;
const PASSWORD = 'password123';

async function runTest() {
    try {
        console.log('--- Starting Payments Verification ---');

        // 1. Register
        console.log(`Registering user: ${EMAIL}`);
        const authRes = await axios.post(`${API_URL}/auth/register`, {
            email: EMAIL,
            password: PASSWORD,
            first_name: 'Pay',
            last_name: 'Test'
        });
        const token = authRes.data.token;
        console.log('Logged in.');

        // 2. Create Return
        const returnRes = await axios.post(`${API_URL}/returns`,
            { taxYear: 2025, filingStatus: 'SINGLE' },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const returnId = returnRes.data.id;
        console.log(`Created Return ID: ${returnId}`);

        // 3. Add W-2 (to generate tax liability)
        await axios.post(`${API_URL}/returns/${returnId}/w2`, {
            employer: 'Tech Corp',
            wages: 50000,
            federalTaxWithheld: 5000
        }, { headers: { Authorization: `Bearer ${token}` } });
        console.log('Added W-2 ($50,000 wages, $5,000 withheld)');

        // 4. Add Estimated Payment
        await axios.post(`${API_URL}/returns/${returnId}/payments`, {
            payment_type: 'estimated_q1',
            payment_date: '2025-04-15',
            amount: 1000,
            description: 'Q1 Payment'
        }, { headers: { Authorization: `Bearer ${token}` } });
        console.log('Added Estimated Payment ($1,000)');

        // 5. Calculate
        console.log('Calculating...');
        const calcRes = await axios.post(`${API_URL}/returns/${returnId}/calculate`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const lines = calcRes.data.lines;
        const line25d = lines.find(l => l.lineNumber === '25d');
        const line26 = lines.find(l => l.lineNumber === '26');
        const line33 = lines.find(l => l.lineNumber === '33');
        const line24 = lines.find(l => l.lineNumber === '24'); // Total Tax
        const refund = calcRes.data.refund;

        console.log(`Line 25d (Withholding): ${line25d.value} (Expected: 5000)`);
        console.log(`Line 26 (Est Payments): ${line26.value} (Expected: 1000)`);
        console.log(`Line 33 (Total Payments): ${line33.value} (Expected: 6000)`);
        console.log(`Line 24 (Total Tax): ${line24.value}`);
        console.log(`Refund: ${refund}`);
        console.log(`Amount Owed: ${calcRes.data.amountOwed}`);

        require('fs').writeFileSync('verify_payments_debug.txt',
            `Tax: ${line24.value}\nPayments: ${line33.value}\nRefund: ${refund}\nOwed: ${calcRes.data.amountOwed}\n`
        );

        if (line26.value !== 1000) throw new Error('Line 26 incorrect');
        if (line33.value !== 6000) throw new Error('Line 33 incorrect');
        if (refund !== Math.max(0, 6000 - line24.value)) throw new Error('Refund calculation mismatch: ' + refund + ' vs ' + Math.max(0, 6000 - line24.value));

        console.log('SUCCESS: Payments correctly applied.');

    } catch (error) {
        const errMsg = error.response ? JSON.stringify(error.response.data) : error.message;
        console.error('Test Failed:', errMsg);
        require('fs').writeFileSync('verify_payments_error.log', errMsg);
        process.exit(1);
    }
}

runTest();
