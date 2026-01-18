CREATE TABLE IF NOT EXISTS schedule_a (
    id SERIAL PRIMARY KEY,
    return_id INTEGER REFERENCES returns(id) ON DELETE CASCADE,
    medical_expenses DECIMAL(10, 2) DEFAULT 0,
    state_local_income_taxes DECIMAL(10, 2) DEFAULT 0,
    real_estate_taxes DECIMAL(10, 2) DEFAULT 0,
    personal_property_taxes DECIMAL(10, 2) DEFAULT 0,
    mortgage_interest DECIMAL(10, 2) DEFAULT 0,
    charitable_contributions_cash DECIMAL(10, 2) DEFAULT 0,
    charitable_contributions_noncash DECIMAL(10, 2) DEFAULT 0,
    casualty_losses DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
