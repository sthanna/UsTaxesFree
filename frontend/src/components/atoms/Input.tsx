import React from 'react';
import { LucideIcon } from 'lucide-react';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputState = 'default' | 'error' | 'success';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    /** Size of the input */
    size?: InputSize;
    /** Validation state */
    state?: InputState;
    /** Icon to display before input */
    leftIcon?: LucideIcon;
    /** Icon to display after input */
    rightIcon?: LucideIcon;
    /** Full width input */
    fullWidth?: boolean;
}

const sizeStyles: Record<InputSize, string> = {
    sm: 'px-3 py-1.5 text-sm rounded-md min-h-[32px]',
    md: 'px-4 py-2 text-base rounded-lg min-h-[40px]',
    lg: 'px-5 py-2.5 text-lg rounded-lg min-h-[48px]'
};

const stateStyles: Record<InputState, string> = {
    default: 'border-neutral-gray-300 focus:border-trust-blue-500 focus:ring-trust-blue-500',
    error: 'border-alert-red-500 focus:border-alert-red-500 focus:ring-alert-red-500',
    success: 'border-financial-green-500 focus:border-financial-green-500 focus:ring-financial-green-500'
};

const iconSizes: Record<InputSize, number> = {
    sm: 14,
    md: 16,
    lg: 20
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    (
        {
            size = 'md',
            state = 'default',
            leftIcon: LeftIcon,
            rightIcon: RightIcon,
            fullWidth = true,
            disabled,
            className = '',
            type = 'text',
            ...props
        },
        ref
    ) => {
        const iconSize = iconSizes[size];

        const baseStyles = 'border bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-neutral-gray-100 disabled:text-neutral-gray-500 disabled:cursor-not-allowed';
        const widthStyle = fullWidth ? 'w-full' : '';
        const paddingStyle = LeftIcon ? 'pl-10' : RightIcon ? 'pr-10' : '';

        const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${stateStyles[state]} ${widthStyle} ${paddingStyle} ${className}`.trim();

        return (
            <div className={`relative ${fullWidth ? 'w-full' : 'inline-block'}`}>
                {LeftIcon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-gray-500 pointer-events-none">
                        <LeftIcon size={iconSize} aria-hidden="true" />
                    </div>
                )}

                <input
                    ref={ref}
                    type={type}
                    disabled={disabled}
                    className={combinedClassName}
                    {...props}
                />

                {RightIcon && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-gray-500 pointer-events-none">
                        <RightIcon size={iconSize} aria-hidden="true" />
                    </div>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
