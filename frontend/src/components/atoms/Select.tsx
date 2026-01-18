import React from 'react';
import { ChevronDown } from 'lucide-react';

export type SelectSize = 'sm' | 'md' | 'lg';
export type SelectState = 'default' | 'error' | 'success';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    /** Size of the select */
    size?: SelectSize;
    /** Validation state */
    state?: SelectState;
    /** Full width select */
    fullWidth?: boolean;
    /** Children (option elements) */
    children: React.ReactNode;
}

const sizeStyles: Record<SelectSize, string> = {
    sm: 'px-3 py-1.5 text-sm rounded-md min-h-[32px]',
    md: 'px-4 py-2 text-base rounded-lg min-h-[40px]',
    lg: 'px-5 py-2.5 text-lg rounded-lg min-h-[48px]'
};

const stateStyles: Record<SelectState, string> = {
    default: 'border-neutral-gray-300 focus:border-trust-blue-500 focus:ring-trust-blue-500',
    error: 'border-alert-red-500 focus:border-alert-red-500 focus:ring-alert-red-500',
    success: 'border-financial-green-500 focus:border-financial-green-500 focus:ring-financial-green-500'
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    (
        {
            size = 'md',
            state = 'default',
            fullWidth = true,
            disabled,
            className = '',
            children,
            ...props
        },
        ref
    ) => {
        const baseStyles = 'border bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-neutral-gray-100 disabled:text-neutral-gray-500 disabled:cursor-not-allowed appearance-none pr-10';
        const widthStyle = fullWidth ? 'w-full' : '';

        const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${stateStyles[state]} ${widthStyle} ${className}`.trim();

        return (
            <div className={`relative ${fullWidth ? 'w-full' : 'inline-block'}`}>
                <select
                    ref={ref}
                    disabled={disabled}
                    className={combinedClassName}
                    {...props}
                >
                    {children}
                </select>

                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-gray-500 pointer-events-none">
                    <ChevronDown size={16} aria-hidden="true" />
                </div>
            </div>
        );
    }
);

Select.displayName = 'Select';
