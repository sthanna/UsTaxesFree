import pool from '../database/connection';
import crypto from 'crypto';

export interface AuditLogEntry {
    userId?: number;
    returnId?: number;
    action: string;
    entityType?: string;
    entityId?: number;
    changes?: any;
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
}

export class AuditLogService {
    /**
     * Log an audit entry (immutable record)
     */
    static async log(entry: AuditLogEntry): Promise<void> {
        const client = await pool.connect();
        try {
            const hash = this.generateHash(entry);

            await client.query(
                `INSERT INTO audit_logs (
                    user_id, return_id, action, entity_type, entity_id,
                    changes_json, ip_address, user_agent, request_id, hash
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                [
                    entry.userId || null,
                    entry.returnId || null,
                    entry.action,
                    entry.entityType || null,
                    entry.entityId || null,
                    entry.changes ? JSON.stringify(entry.changes) : null,
                    entry.ipAddress || null,
                    entry.userAgent || null,
                    entry.requestId || null,
                    hash,
                ]
            );
        } finally {
            client.release();
        }
    }

    /**
     * Generate SHA256 hash for audit entry integrity
     */
    private static generateHash(entry: AuditLogEntry): string {
        const data = JSON.stringify({
            userId: entry.userId,
            returnId: entry.returnId,
            action: entry.action,
            entityType: entry.entityType,
            entityId: entry.entityId,
            changes: entry.changes,
            timestamp: new Date().toISOString(),
        });
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    /**
     * Get audit logs for a specific return
     */
    static async getLogsByReturnId(returnId: number, limit: number = 100): Promise<any[]> {
        const client = await pool.connect();
        try {
            const result = await client.query(
                `SELECT * FROM audit_logs
                 WHERE return_id = $1
                 ORDER BY created_at DESC
                 LIMIT $2`,
                [returnId, limit]
            );
            return result.rows;
        } finally {
            client.release();
        }
    }

    /**
     * Get audit logs for a specific user
     */
    static async getLogsByUserId(userId: number, limit: number = 100): Promise<any[]> {
        const client = await pool.connect();
        try {
            const result = await client.query(
                `SELECT * FROM audit_logs
                 WHERE user_id = $1
                 ORDER BY created_at DESC
                 LIMIT $2`,
                [userId, limit]
            );
            return result.rows;
        } finally {
            client.release();
        }
    }

    /**
     * Verify audit log integrity
     */
    static async verifyIntegrity(auditLogId: string): Promise<boolean> {
        const client = await pool.connect();
        try {
            const result = await client.query(
                'SELECT * FROM audit_logs WHERE id = $1',
                [auditLogId]
            );

            if (result.rows.length === 0) {
                return false;
            }

            const log = result.rows[0];
            const expectedHash = this.generateHash({
                userId: log.user_id,
                returnId: log.return_id,
                action: log.action,
                entityType: log.entity_type,
                entityId: log.entity_id,
                changes: log.changes_json,
            });

            return log.hash === expectedHash;
        } finally {
            client.release();
        }
    }
}
