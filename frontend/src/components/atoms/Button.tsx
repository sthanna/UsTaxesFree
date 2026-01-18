import React from 'react';
import { Loader2, LucideIcon } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Visual style variant */
    variant?: ButtonVariant;
    /** Size of the button */
    size?: ButtonSize;
    /** Loading state - shows spinner and disables button */
    loading?: boolean;
    /** Icon to display before text */
    leftIcon?: LucideIcon;
    /** Icon to display after text */
    rightIcon?: LucideIcon;
    /** Make button full width */
    fullWidth?: boolean;
    /** Children content */
    children?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-trust-blue-500 text-white hover:bg-trust-blue-600 active:bg-trust-blue-700 disabled:bg-trust-blue-300 disabled:cursor-not-allowed shadow-sm',
    secondary: 'bg-white text-trust-blue-600 border-2 border-trust-blue-500 hover:bg-trust-blue-50 active:bg-trust-blue-100 disabled:border-trust-blue-200 disabled:text-trust-blue-300 disabled:cursor-not-allowed',
    success: 'bg-financial-green-500 text-white hover:bg-financial-green-600 active:bg-financial-green-700 disabled:bg-financial-green-300 disabled:cursor-not-allowed shadow-sm',
    danger: 'bg-alert-red-500 text-white hover:bg-alert-red-600 active:bg-alert-red-700 disabled:bg-alert-red-300 disabled:cursor-not-allowed shadow-sm',
    ghost: 'bg-transparent text-neutral-gray-700 hover:bg-neutral-gray-100 active:bg-neutral-gray-200 disabled:text-neutral-gray-400 disabled:cursor-not-allowed'
};

const sizeStyles: Record<ButtonSize, string> = {
    xs: 'px-2 py-1 text-xs rounded-md min-h-[24px]',
    sm: 'px-3 py-1.5 text-sm rounded-md min-h-[32px]',
    md: 'px-4 py-2 text-base rounded-lg min-h-[40px]',
    lg: 'px-5 py-2.5 text-lg rounded-lg min-h-[48px]',
    xl: 'px-6 py-3 text-xl rounded-xl min-h-[56px]'
};

const iconSizes: Record<ButtonSize, number> = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'primary',
            size = 'md',
            loading = false,
            leftIcon: LeftIcon,
            rightIcon: RightIcon,
            fullWidth = false,
            disabled,
            children,
            className = '',
            type = 'button',
            ...props
        },
        ref
    ) => {
        const isDisabled = disabled || loading;
        const iconSize = iconSizes[size];

        const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-blue-500 focus-visible:ring-offset-2';
        const widthStyle = fullWidth ? 'w-full' : '';

        const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`.trim();

        return (
            <button
                ref={ref}
                type={type}
                disabled={isDisabled}
                className={combinedClassName}
                {...props}
            >
                {loading ? (
                    <Loader2
                        className="animate-spin mr-2"
                        size={iconSize}
                        aria-label="Loading"
                    />
                ) : LeftIcon ? (
                    <LeftIcon className="mr-2" size={iconSize} aria-hidden="true" />
                ) : null}

                {children}

                {!loading && RightIcon && (
                    <RightIcon className="ml-2" size={iconSize} aria-hidden="true" />
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';
