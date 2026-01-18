import React from 'react';
import { LucideIcon } from 'lucide-react';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type IconColor = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'current';

export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
    /** The lucide-react icon component */
    icon: LucideIcon;
    /** Size of the icon */
    size?: IconSize;
    /** Color variant */
    color?: IconColor;
}

const sizeValues: Record<IconSize, number> = {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    '2xl': 48
};

const colorStyles: Record<IconColor, string> = {
    primary: 'text-trust-blue-500',
    secondary: 'text-neutral-gray-500',
    success: 'text-financial-green-500',
    danger: 'text-alert-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
    current: 'text-current'
};

export const Icon: React.FC<IconProps> = ({
    icon: IconComponent,
    size = 'md',
    color = 'current',
    className = '',
    ...props
}) => {
    const iconSize = sizeValues[size];

    return (
        <span
            className={`inline-flex items-center justify-center ${colorStyles[color]} ${className}`.trim()}
            {...props}
        >
            <IconComponent size={iconSize} aria-hidden="true" />
        </span>
    );
};

Icon.displayName = 'Icon';
