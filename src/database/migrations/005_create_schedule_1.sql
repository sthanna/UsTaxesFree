-- Schedule 1: Additional Income and Adjustments to Income
CREATE TABLE IF NOT EXISTS schedule_1_additional_income (
    id SERIAL PRIMARY KEY,
    return_id INTEGER REFERENCES returns(id) ON DELETE CASCADE,
    -- Additional Income (Lines 1-10)
    taxable_refunds_credits DECIMAL(12, 2) DEFAULT 0,  -- Line 1
    alimony_received DECIMAL(12, 2) DEFAULT 0,          -- Line 2a
    business_income DECIMAL(12, 2) DEFAULT 0,           -- Line 3
    other_gains_losses DECIMAL(12, 2) DEFAULT 0,        -- Line 4
    rental_income DECIMAL(12, 2) DEFAULT 0,             -- Line 5
    farm_income DECIMAL(12, 2) DEFAULT 0,               -- Line 6
    unemployment_compensation DECIMAL(12, 2) DEFAULT 0, -- Line 7
    other_income_description TEXT,                       -- Line 8z description
    other_income_amount DECIMAL(12, 2) DEFAULT 0,       -- Line 8z amount
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(return_id)
);

CREATE TABLE IF NOT EXISTS schedule_1_adjustments (
    id SERIAL PRIMARY KEY,
    return_id INTEGER REFERENCES returns(id) ON DELETE CASCADE,
    -- Adjustments to Income (Lines 11-26)
    educator_expenses DECIMAL(12, 2) DEFAULT 0,         -- Line 11
    business_expenses DECIMAL(12, 2) DEFAULT 0,         -- Line 12
    health_savings_account DECIMAL(12, 2) DEFAULT 0,    -- Line 13
    moving_expenses DECIMAL(12, 2) DEFAULT 0,           -- Line 14
    self_employment_sep DECIMAL(12, 2) DEFAULT 0,       -- Line 15
    self_employment_health DECIMAL(12, 2) DEFAULT 0,    -- Line 16
    penalty_early_withdrawal DECIMAL(12, 2) DEFAULT 0,  -- Line 17
    alimony_paid DECIMAL(12, 2) DEFAULT 0,              -- Line 18a
    alimony_recipients_ssn VARCHAR(11),                 -- Line 18b
    ira_deduction DECIMAL(12, 2) DEFAULT 0,             -- Line 19
    student_loan_interest DECIMAL(12, 2) DEFAULT 0,     -- Line 20
    tuition_fees DECIMAL(12, 2) DEFAULT 0,              -- Line 21 (deprecated but keeping for historical)
    other_adjustments_description TEXT,                  -- Line 24z description
    other_adjustments_amount DECIMAL(12, 2) DEFAULT 0,  -- Line 24z amount
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(return_id)
);

CREATE INDEX IF NOT EXISTS idx_schedule_1_income_return ON schedule_1_additional_income(return_id);
CREATE INDEX IF NOT EXISTS idx_schedule_1_adjustments_return ON schedule_1_adjustments(return_id);
