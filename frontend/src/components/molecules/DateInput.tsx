import React from 'react';
import { Calendar } from 'lucide-react';
import { Input, InputProps } from '../atoms/Input';

export interface DateInputProps extends Omit<InputProps, 'type' | 'leftIcon'> {
    /** Minimum date (YYYY-MM-DD format) */
    min?: string;
    /** Maximum date (YYYY-MM-DD format) */
    max?: string;
}

export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
    (props, ref) => {
        return (
            <Input
                ref={ref}
                type="date"
                leftIcon={Calendar}
                {...props}
            />
        );
    }
);

DateInput.displayName = 'DateInput';
