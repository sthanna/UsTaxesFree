-- Tax rules versions table
CREATE TABLE IF NOT EXISTS tax_rules_versions (
    id SERIAL PRIMARY KEY,
    version VARCHAR(20) NOT NULL UNIQUE,
    tax_year INTEGER NOT NULL,
    jurisdiction VARCHAR(20) NOT NULL,
    rule_content JSONB NOT NULL,
    rule_hash VARCHAR(64),
    git_commit_sha VARCHAR(40),
    git_branch VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    activated_at TIMESTAMPTZ,
    deprecated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tax_rules_year_juris ON tax_rules_versions(tax_year, jurisdiction);
CREATE INDEX IF NOT EXISTS idx_tax_rules_active ON tax_rules_versions(activated_at) WHERE activated_at IS NOT NULL;

-- Tax rules history table
CREATE TABLE IF NOT EXISTS tax_rules_history (
    id SERIAL PRIMARY KEY,
    rules_version_id INTEGER REFERENCES tax_rules_versions(id) ON DELETE CASCADE,
    change_type VARCHAR(50),
    rule_path VARCHAR(255),
    old_value JSONB,
    new_value JSONB,
    change_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rules_history_version ON tax_rules_history(rules_version_id);

-- Audit logs table (if not exists)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    return_id INTEGER REFERENCES returns(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    changes_json JSONB,
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(100),
    hash VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_return ON audit_logs(return_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
