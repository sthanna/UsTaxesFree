import { Request, Response, NextFunction } from 'express';
import { AuditLogService } from '../../services/audit-log';
import { AuthRequest } from './auth';
import { v4 as uuidv4 } from 'uuid';

/**
 * Audit logging middleware
 * Logs all authenticated requests
 */
export const auditMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const requestId = uuidv4();
    req.headers['x-request-id'] = requestId;

    // Capture original response methods
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    let responseBody: any;

    // Override json method
    res.json = function (body: any) {
        responseBody = body;
        return originalJson(body);
    };

    // Override send method
    res.send = function (body: any) {
        responseBody = body;
        return originalSend(body);
    };

    // Log request completion
    res.on('finish', async () => {
        try {
            // Only log authenticated requests
            if (!req.user) {
                return;
            }

            const action = `${req.method}_${req.path}`;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || 'unknown';
            const userAgent = req.headers['user-agent'];

            await AuditLogService.log({
                userId: req.user.id,
                action,
                changes: {
                    method: req.method,
                    path: req.path,
                    statusCode: res.statusCode,
                    body: req.body,
                    response: responseBody,
                },
                ipAddress,
                userAgent,
                requestId,
            });
        } catch (error) {
            console.error('Audit logging failed:', error);
        }
    });

    next();
};

/**
 * Specific audit logger for sensitive operations
 */
export const auditAction = async (
    userId: number,
    action: string,
    details: {
        returnId?: number;
        entityType?: string;
        entityId?: number;
        changes?: any;
    },
    req?: Request
): Promise<void> => {
    const ipAddress = req?.ip || req?.headers['x-forwarded-for'] as string || 'unknown';
    const userAgent = req?.headers['user-agent'];
    const requestId = req?.headers['x-request-id'] as string || uuidv4();

    await AuditLogService.log({
        userId,
        returnId: details.returnId,
        action,
        entityType: details.entityType,
        entityId: details.entityId,
        changes: details.changes,
        ipAddress,
        userAgent,
        requestId,
    });
};
