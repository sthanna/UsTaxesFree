import { query } from './src/database/connection';
import { Form1099Repository } from './src/repositories/form1099';
import { W2Repository } from './src/repositories/w2';

async function test() {
    try {
        console.log('Testing Repository...');

        // 1. Create a raw Return to link to
        const retRes = await query(`INSERT INTO returns (user_id, tax_year, filing_status, status) VALUES (1, 2025, 'SINGLE', 'DRAFT') RETURNING id`);
        const returnId = retRes.rows[0].id;
        console.log('Created Return:', returnId);

        // 2. Test W2
        console.log('Creating W2...');
        const w2 = await W2Repository.create(returnId, { employer: 'Debug Corp', wages: 1000, federalTaxWithheld: 100 });
        console.log('W2 Created:', w2);

        // 3. Test 1099-INT
        console.log('Creating 1099-INT...');
        const int = await Form1099Repository.createInt(returnId, 'Debug Bank', 50);
        console.log('1099-INT Created:', int);

    } catch (e) {
        console.error('Debug Failed:', e);
    }
}

test();
