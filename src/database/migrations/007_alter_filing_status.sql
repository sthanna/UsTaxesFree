-- Increase length of filing_status to accommodate 'HEAD_OF_HOUSEHOLD'
ALTER TABLE returns ALTER COLUMN filing_status TYPE VARCHAR(50);
