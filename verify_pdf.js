const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3000/api';
const EMAIL = `test_pdf_${Date.now()}@example.com`;
const PASSWORD = 'password123';

async function runTest() {
    try {
        console.log('--- Starting PDF Verification ---');

        // 1. Register
        console.log(`Registering user: ${EMAIL}`);
        const authRes = await axios.post(`${API_URL}/auth/register`, {
            email: EMAIL,
            password: PASSWORD,
            first_name: 'PDF',
            last_name: 'Tester'
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

        // 3. Add W-2
        await axios.post(`${API_URL}/returns/${returnId}/w2`, {
            employer: 'PDF Corp',
            wages: 60000,
            federalTaxWithheld: 7000
        }, { headers: { Authorization: `Bearer ${token}` } });

        // 4. Calculate
        console.log('Calculating...');
        await axios.post(`${API_URL}/returns/${returnId}/calculate`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // 5. Download PDF
        console.log('Downloading PDF...');
        const pdfRes = await axios.get(`${API_URL}/pdf/${returnId}/download`, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'arraybuffer'
        });

        const pdfPath = path.resolve(__dirname, `test_return_${returnId}.pdf`);
        fs.writeFileSync(pdfPath, pdfRes.data);
        console.log(`PDF Saved to: ${pdfPath}`);

        const stats = fs.statSync(pdfPath);
        console.log(`PDF Size: ${stats.size} bytes`);

        if (stats.size < 1000) {
            throw new Error('PDF too small, likely failed or empty.');
        }

        // Basic check for PDF magic bytes
        const buffer = fs.readFileSync(pdfPath);
        const header = buffer.toString('utf8', 0, 4);
        if (header !== '%PDF') {
            throw new Error('File is not a valid PDF (missing %PDF header)');
        }

        console.log('SUCCESS: PDF generated and downloaded validly.');

    } catch (error) {
        const errMsg = error.response ? JSON.stringify(error.response.data) : error.message;
        console.error('Test Failed:', errMsg);
        process.exit(1);
    }
}

runTest();
