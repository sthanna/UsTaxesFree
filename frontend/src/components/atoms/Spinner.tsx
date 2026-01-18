import React from 'react';
import { Loader2 } from 'lucide-react';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'primary' | 'secondary' | 'white';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Size of the spinner */
    size?: SpinnerSize;
    /** Color variant */
    variant?: SpinnerVariant;
    /** Text to display next to spinner */
    label?: string;
}

const sizeStyles: Record<SpinnerSize, number> = {
    xs: 12,
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48
};

const variantStyles: Record<SpinnerVariant, string> = {
    primary: 'text-trust-blue-500',
    secondary: 'text-neutral-gray-500',
    white: 'text-white'
};

export const Spinner: React.FC<SpinnerProps> = ({
    size = 'md',
    variant = 'primary',
    label,
    className = '',
    ...props
}) => {
    const iconSize = sizeStyles[size];

    return (
        <div
            className={`inline-flex items-center ${className}`.trim()}
            role="status"
            aria-label={label || 'Loading'}
            {...props}
        >
            <Loader2
                size={iconSize}
                className={`${variantStyles[variant]} animate-spin`}
                aria-hidden="true"
            />
            {label && (
                <span className="ml-2 text-sm text-neutral-gray-700">
                    {label}
                </span>
            )}
            <span className="sr-only">{label || 'Loading'}</span>
        </div>
    );
};

Spinner.displayName = 'Spinner';
