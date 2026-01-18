import pool from './connection';
import fs from 'fs';
import path from 'path';

async function initDB() {
    const client = await pool.connect();
    try {
        console.log('Initializing database...');

        console.log('Initializing database...');

        const migrationsDir = path.join(__dirname, 'migrations');
        const files = fs.readdirSync(migrationsDir).sort();

        await client.query('BEGIN');

        for (const file of files) {
            if (file.endsWith('.sql')) {
                console.log(`Running migration: ${file}`);
                const filePath = path.join(migrationsDir, file);
                const sql = fs.readFileSync(filePath, 'utf8');
                await client.query(sql);
            }
        }
        await client.query('COMMIT');

        console.log('Database initialized successfully.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Failed to initialize database:', error);
        process.exit(1);
    } finally {
        client.release();
        pool.end();
    }
}

if (require.main === module) {
    initDB();
}
