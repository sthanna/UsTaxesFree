// IMPORTANT: OpenTelemetry must be initialized FIRST, before any other imports
import dotenv from 'dotenv';
dotenv.config();

// Initialize OpenTelemetry (must be before other imports)
import { initializeOpenTelemetry } from './observability/otel-setup';
const otelSdk = initializeOpenTelemetry();

import express, { Request, Response } from 'express';
// Restart trigger 2
import cors from 'cors';
import helmet from 'helmet';
// import routes from './api/routes'; // Placeholder for future routes

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health Check Routes
import pool from './database/connection';

// Liveness probe - basic health check
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Readiness probe - checks database connectivity
console.log('Registering /ready route'); // Debug log
app.get('/ready', async (_req: Request, res: Response) => {
    try {
        // Test database connection
        const result = await pool.query('SELECT 1 as healthy');

        if (result.rows[0].healthy === 1) {
            res.status(200).json({
                status: 'ready',
                timestamp: new Date().toISOString(),
                checks: {
                    database: 'healthy'
                }
            });
        } else {
            throw new Error('Database check failed');
        }
    } catch (error) {
        console.error('Readiness check failed:', error);
        res.status(503).json({
            status: 'not_ready',
            timestamp: new Date().toISOString(),
            checks: {
                database: 'unhealthy'
            },
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

import authRoutes from './api/routes/auth';
import returnRoutes from './api/routes/returns';
import calculateRoutes from './api/routes/calculate';
import pdfRoutes from './api/routes/pdf';
import formRoutes from './api/routes/forms';
import efileRoutes from './api/routes/efile';
import schedule1Routes from './api/routes/schedule1';
import dependentsRoutes from './api/routes/dependents';
import paymentsRoutes from './api/routes/payments';
import scheduleARoutes from './api/routes/scheduleA';

// ...
app.use('/api/auth', authRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/returns', calculateRoutes); // Mounted on returns for :id context
app.use('/api/returns', pdfRoutes);
app.use('/api/returns', formRoutes);
app.use('/api/returns', efileRoutes);
app.use('/api/schedule1', schedule1Routes); // Keep as is if verification expects it here, or move to returns
app.use('/api/returns', scheduleARoutes);
app.use('/api/returns', dependentsRoutes);
app.use('/api/returns', paymentsRoutes);

// Start Server
let server: any;
if (require.main === module) {
    server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = async (signal: string) => {
        console.log(`${signal} received. Starting graceful shutdown...`);

        if (server) {
            server.close(async () => {
                console.log('HTTP server closed');

                // Close database connections
                try {
                    await pool.end();
                    console.log('Database pool closed');
                } catch (error) {
                    console.error('Error closing database pool:', error);
                }

                console.log('Graceful shutdown complete');
                process.exit(0);
            });
        }

        // Force shutdown after 10 seconds
        setTimeout(() => {
            console.error('Forced shutdown after timeout');
            process.exit(1);
        }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

export default app;
