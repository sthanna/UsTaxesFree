import React from 'react';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    /** Visual variant */
    variant?: BadgeVariant;
    /** Size of the badge */
    size?: BadgeSize;
    /** Dot indicator */
    dot?: boolean;
    /** Children content */
    children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
    default: 'bg-neutral-gray-100 text-neutral-gray-700 border-neutral-gray-200',
    primary: 'bg-trust-blue-100 text-trust-blue-700 border-trust-blue-200',
    success: 'bg-financial-green-100 text-financial-green-700 border-financial-green-200',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    danger: 'bg-alert-red-100 text-alert-red-700 border-alert-red-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200'
};

const sizeStyles: Record<BadgeSize, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
};

const dotVariantColors: Record<BadgeVariant, string> = {
    default: 'bg-neutral-gray-500',
    primary: 'bg-trust-blue-500',
    success: 'bg-financial-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-alert-red-500',
    info: 'bg-blue-500'
};

export const Badge: React.FC<BadgeProps> = ({
    variant = 'default',
    size = 'md',
    dot = false,
    children,
    className = '',
    ...props
}) => {
    const baseStyles = 'inline-flex items-center font-medium border rounded-full whitespace-nowrap';

    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`.trim();

    return (
        <span className={combinedClassName} {...props}>
            {dot && (
                <span
                    className={`${dotVariantColors[variant]} w-1.5 h-1.5 rounded-full mr-1.5`}
                    aria-hidden="true"
                />
            )}
            {children}
        </span>
    );
};

Badge.displayName = 'Badge';
