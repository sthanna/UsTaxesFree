import { query } from './src/database/connection';
import { Form1099BRepository } from './src/repositories/form1099b';

async function test() {
    try {
        console.log('Testing 1099-B Repository...');

        // 1. Create a Return
        const retRes = await query(`INSERT INTO returns (user_id, tax_year, filing_status, status) VALUES (1, 2025, 'SINGLE', 'DRAFT') RETURNING id`);
        const returnId = retRes.rows[0].id;
        console.log('Created Return:', returnId);

        // 2. Test 1099-B
        console.log('Creating 1099-B...');
        const b = await Form1099BRepository.create(returnId, { description: 'Tesla', proceeds: 1000, costBasis: 500, isLongTerm: true });
        console.log('1099-B Created:', b);

        // 3. Find
        const forms = await Form1099BRepository.findByReturnId(returnId);
        console.log('Found:', forms);

    } catch (e) {
        console.error('Debug Failed:', e);
    }
}

test();
