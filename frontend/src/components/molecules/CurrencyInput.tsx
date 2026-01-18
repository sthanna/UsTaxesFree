import React, { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';
import { Input, InputProps } from '../atoms/Input';

export interface CurrencyInputProps extends Omit<InputProps, 'type' | 'leftIcon' | 'value' | 'onChange'> {
    /** Current value as number */
    value?: number | string;
    /** Change handler receiving number value */
    onChange?: (value: number) => void;
    /** Allow negative values */
    allowNegative?: boolean;
    /** Decimal places (default: 2) */
    decimalPlaces?: number;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
    (
        {
            value = '',
            onChange,
            allowNegative = false,
            decimalPlaces = 2,
            placeholder = '0.00',
            ...props
        },
        ref
    ) => {
        const [displayValue, setDisplayValue] = useState('');

        // Format number to currency display
        const formatCurrency = (val: number | string): string => {
            if (val === '' || val === undefined || val === null) return '';

            const numVal = typeof val === 'string' ? parseFloat(val) : val;
            if (isNaN(numVal)) return '';

            return numVal.toFixed(decimalPlaces);
        };

        // Parse currency string to number
        const parseCurrency = (val: string): number => {
            const cleaned = val.replace(/[^0-9.-]/g, '');
            const parsed = parseFloat(cleaned);
            return isNaN(parsed) ? 0 : parsed;
        };

        // Update display value when prop value changes
        useEffect(() => {
            setDisplayValue(formatCurrency(value));
        }, [value, decimalPlaces]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            let inputValue = e.target.value;

            // Remove non-numeric characters except decimal point and minus
            inputValue = inputValue.replace(/[^0-9.-]/g, '');

            // Handle negative sign
            if (!allowNegative) {
                inputValue = inputValue.replace(/-/g, '');
            } else {
                // Only allow negative sign at the beginning
                const hasNegative = inputValue.startsWith('-');
                inputValue = inputValue.replace(/-/g, '');
                if (hasNegative) inputValue = '-' + inputValue;
            }

            // Only allow one decimal point
            const parts = inputValue.split('.');
            if (parts.length > 2) {
                inputValue = parts[0] + '.' + parts.slice(1).join('');
            }

            // Limit decimal places
            if (parts.length === 2 && parts[1].length > decimalPlaces) {
                inputValue = parts[0] + '.' + parts[1].substring(0, decimalPlaces);
            }

            setDisplayValue(inputValue);

            if (onChange) {
                const numericValue = parseCurrency(inputValue);
                onChange(numericValue);
            }
        };

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            // Format on blur
            const numericValue = parseCurrency(displayValue);
            setDisplayValue(formatCurrency(numericValue));

            if (props.onBlur) {
                props.onBlur(e);
            }
        };

        return (
            <Input
                ref={ref}
                type="text"
                inputMode="decimal"
                leftIcon={DollarSign}
                value={displayValue}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={placeholder}
                {...props}
            />
        );
    }
);

CurrencyInput.displayName = 'CurrencyInput';
