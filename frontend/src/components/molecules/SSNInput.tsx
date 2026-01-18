import React, { useState, useEffect } from 'react';
import { Input, InputProps } from '../atoms/Input';

export interface SSNInputProps extends Omit<InputProps, 'type' | 'value' | 'onChange' | 'maxLength'> {
    /** Current value (formatted or unformatted) */
    value?: string;
    /** Change handler receiving formatted SSN */
    onChange?: (value: string) => void;
}

export const SSNInput = React.forwardRef<HTMLInputElement, SSNInputProps>(
    (
        {
            value = '',
            onChange,
            placeholder = 'XXX-XX-XXXX',
            ...props
        },
        ref
    ) => {
        const [displayValue, setDisplayValue] = useState('');

        // Format SSN: XXX-XX-XXXX
        const formatSSN = (val: string): string => {
            // Remove all non-digits
            const digits = val.replace(/\D/g, '');

            // Limit to 9 digits
            const limited = digits.substring(0, 9);

            // Format as XXX-XX-XXXX
            if (limited.length <= 3) {
                return limited;
            } else if (limited.length <= 5) {
                return `${limited.slice(0, 3)}-${limited.slice(3)}`;
            } else {
                return `${limited.slice(0, 3)}-${limited.slice(3, 5)}-${limited.slice(5)}`;
            }
        };

        // Update display value when prop value changes
        useEffect(() => {
            setDisplayValue(formatSSN(value));
        }, [value]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const inputValue = e.target.value;
            const formatted = formatSSN(inputValue);

            setDisplayValue(formatted);

            if (onChange) {
                onChange(formatted);
            }
        };

        return (
            <Input
                ref={ref}
                type="text"
                inputMode="numeric"
                value={displayValue}
                onChange={handleChange}
                placeholder={placeholder}
                maxLength={11} // XXX-XX-XXXX = 11 characters
                {...props}
            />
        );
    }
);

SSNInput.displayName = 'SSNInput';
