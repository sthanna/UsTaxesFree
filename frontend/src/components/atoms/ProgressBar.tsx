import React from 'react';

export type ProgressBarSize = 'sm' | 'md' | 'lg';
export type ProgressBarVariant = 'primary' | 'success' | 'warning' | 'danger';

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Current progress value (0-100) */
    value: number;
    /** Maximum value (default: 100) */
    max?: number;
    /** Size of progress bar */
    size?: ProgressBarSize;
    /** Color variant */
    variant?: ProgressBarVariant;
    /** Show percentage label */
    showLabel?: boolean;
    /** Custom label text */
    label?: string;
}

const sizeStyles: Record<ProgressBarSize, string> = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
};

const variantStyles: Record<ProgressBarVariant, string> = {
    primary: 'bg-trust-blue-500',
    success: 'bg-financial-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-alert-red-500'
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
    value,
    max = 100,
    size = 'md',
    variant = 'primary',
    showLabel = false,
    label,
    className = '',
    ...props
}) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    const displayLabel = label || `${Math.round(percentage)}%`;

    return (
        <div className={`w-full ${className}`.trim()} {...props}>
            {showLabel && (
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-neutral-gray-700">
                        {displayLabel}
                    </span>
                </div>
            )}

            <div
                className={`w-full bg-neutral-gray-200 rounded-full overflow-hidden ${sizeStyles[size]}`}
                role="progressbar"
                aria-valuenow={value}
                aria-valuemin={0}
                aria-valuemax={max}
                aria-label={label || `Progress: ${Math.round(percentage)}%`}
            >
                <div
                    className={`${variantStyles[variant]} ${sizeStyles[size]} transition-all duration-300 ease-out rounded-full`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

ProgressBar.displayName = 'ProgressBar';
