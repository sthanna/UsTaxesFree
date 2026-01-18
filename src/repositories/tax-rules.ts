import pool from '../database/connection';

export interface TaxRulesVersion {
    id: number;
    version: string;
    tax_year: number;
    jurisdiction: string;
    rule_content: any;
    rule_hash: string;
    git_commit_sha?: string;
    git_branch?: string;
    created_at: Date;
    activated_at?: Date;
    deprecated_at?: Date;
}

export class TaxRulesRepository {
    /**
     * Get active rules for a specific year and jurisdiction
     */
    static async getActiveRules(taxYear: number, jurisdiction: string = 'US_FEDERAL'): Promise<TaxRulesVersion | null> {
        const client = await pool.connect();
        try {
            const result = await client.query(
                `SELECT * FROM tax_rules_versions
                 WHERE tax_year = $1
                   AND jurisdiction = $2
                   AND activated_at IS NOT NULL
                   AND (deprecated_at IS NULL OR deprecated_at > NOW())
                 ORDER BY created_at DESC
                 LIMIT 1`,
                [taxYear, jurisdiction]
            );

            if (result.rows.length === 0) {
                return null;
            }

            return result.rows[0];
        } finally {
            client.release();
        }
    }

    /**
     * Get rules by version string
     */
    static async getRulesByVersion(version: string): Promise<TaxRulesVersion | null> {
        const client = await pool.connect();
        try {
            const result = await client.query(
                'SELECT * FROM tax_rules_versions WHERE version = $1',
                [version]
            );

            if (result.rows.length === 0) {
                return null;
            }

            return result.rows[0];
        } finally {
            client.release();
        }
    }

    /**
     * Create new tax rules version
     */
    static async createRulesVersion(data: {
        version: string;
        taxYear: number;
        jurisdiction: string;
        ruleContent: any;
        ruleHash: string;
        gitCommitSha?: string;
        gitBranch?: string;
    }): Promise<TaxRulesVersion> {
        const client = await pool.connect();
        try {
            const result = await client.query(
                `INSERT INTO tax_rules_versions (
                    version, tax_year, jurisdiction, rule_content,
                    rule_hash, git_commit_sha, git_branch
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *`,
                [
                    data.version,
                    data.taxYear,
                    data.jurisdiction,
                    JSON.stringify(data.ruleContent),
                    data.ruleHash,
                    data.gitCommitSha || null,
                    data.gitBranch || null,
                ]
            );

            return result.rows[0];
        } finally {
            client.release();
        }
    }

    /**
     * Activate a rules version
     */
    static async activateRulesVersion(version: string): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query(
                'UPDATE tax_rules_versions SET activated_at = NOW() WHERE version = $1',
                [version]
            );
        } finally {
            client.release();
        }
    }

    /**
     * Deprecate a rules version
     */
    static async deprecateRulesVersion(version: string): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query(
                'UPDATE tax_rules_versions SET deprecated_at = NOW() WHERE version = $1',
                [version]
            );
        } finally {
            client.release();
        }
    }

    /**
     * Get all versions for a tax year
     */
    static async getAllVersionsForYear(taxYear: number, jurisdiction: string = 'US_FEDERAL'): Promise<TaxRulesVersion[]> {
        const client = await pool.connect();
        try {
            const result = await client.query(
                `SELECT * FROM tax_rules_versions
                 WHERE tax_year = $1 AND jurisdiction = $2
                 ORDER BY created_at DESC`,
                [taxYear, jurisdiction]
            );

            return result.rows;
        } finally {
            client.release();
        }
    }

    /**
     * Log a rule change
     */
    static async logRuleChange(data: {
        rulesVersionId: number;
        changeType: string;
        rulePath: string;
        oldValue?: any;
        newValue?: any;
        changeReason?: string;
    }): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query(
                `INSERT INTO tax_rules_history (
                    rules_version_id, change_type, rule_path,
                    old_value, new_value, change_reason
                ) VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    data.rulesVersionId,
                    data.changeType,
                    data.rulePath,
                    data.oldValue ? JSON.stringify(data.oldValue) : null,
                    data.newValue ? JSON.stringify(data.newValue) : null,
                    data.changeReason || null,
                ]
            );
        } finally {
            client.release();
        }
    }
}
