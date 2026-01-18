-- Dependents table for Child Tax Credit and other credits
CREATE TABLE IF NOT EXISTS dependents (
    id SERIAL PRIMARY KEY,
    return_id INTEGER REFERENCES returns(id) ON DELETE CASCADE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    ssn VARCHAR(11) NOT NULL,  -- Format: XXX-XX-XXXX
    date_of_birth DATE NOT NULL,
    relationship VARCHAR(50) NOT NULL,  -- Child, Stepchild, Foster child, etc.
    months_lived_with INTEGER CHECK (months_lived_with >= 0 AND months_lived_with <= 12),
    is_us_citizen BOOLEAN DEFAULT true,
    is_student BOOLEAN DEFAULT false,
    is_disabled BOOLEAN DEFAULT false,
    qualifies_for_child_tax_credit BOOLEAN DEFAULT false,
    qualifies_for_other_dependent_credit BOOLEAN DEFAULT false,
    qualifies_for_eitc BOOLEAN DEFAULT false,
    care_expenses DECIMAL(12, 2) DEFAULT 0,  -- For child care credit
    care_provider_name VARCHAR(100),
    care_provider_tin VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dependents_return ON dependents(return_id);
CREATE INDEX IF NOT EXISTS idx_dependents_ssn ON dependents(ssn);

-- Tax payments table (estimated payments, withholding, etc.)
CREATE TABLE IF NOT EXISTS tax_payments (
    id SERIAL PRIMARY KEY,
    return_id INTEGER REFERENCES returns(id) ON DELETE CASCADE,
    payment_type VARCHAR(50) NOT NULL,  -- 'estimated_q1', 'estimated_q2', 'estimated_q3', 'estimated_q4', 'withholding', 'other'
    payment_date DATE,
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT,
    confirmation_number VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tax_payments_return ON tax_payments(return_id);
CREATE INDEX IF NOT EXISTS idx_tax_payments_type ON tax_payments(payment_type);
