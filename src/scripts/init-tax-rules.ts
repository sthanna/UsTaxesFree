import { TaxRulesService } from '../services/tax-rules';
import pool from '../database/connection';

async function initializeTaxRules() {
    console.log('Initializing tax rules...');

    try {
        // Bootstrap 2025 rules
        await TaxRulesService.bootstrap2025Rules();

        console.log('Tax rules initialized successfully');
        process.exit(0);
    } catch (error) {
        console.error('Failed to initialize tax rules:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

if (require.main === module) {
    initializeTaxRules();
}
