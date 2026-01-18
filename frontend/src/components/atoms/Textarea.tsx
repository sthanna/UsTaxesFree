import React from 'react';

export type TextareaSize = 'sm' | 'md' | 'lg';
export type TextareaState = 'default' | 'error' | 'success';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    /** Size of the textarea */
    size?: TextareaSize;
    /** Validation state */
    state?: TextareaState;
    /** Full width textarea */
    fullWidth?: boolean;
    /** Number of visible rows */
    rows?: number;
}

const sizeStyles: Record<TextareaSize, string> = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-base rounded-lg',
    lg: 'px-5 py-2.5 text-lg rounded-lg'
};

const stateStyles: Record<TextareaState, string> = {
    default: 'border-neutral-gray-300 focus:border-trust-blue-500 focus:ring-trust-blue-500',
    error: 'border-alert-red-500 focus:border-alert-red-500 focus:ring-alert-red-500',
    success: 'border-financial-green-500 focus:border-financial-green-500 focus:ring-financial-green-500'
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    (
        {
            size = 'md',
            state = 'default',
            fullWidth = true,
            rows = 4,
            disabled,
            className = '',
            ...props
        },
        ref
    ) => {
        const baseStyles = 'border bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-neutral-gray-100 disabled:text-neutral-gray-500 disabled:cursor-not-allowed resize-y';
        const widthStyle = fullWidth ? 'w-full' : '';

        const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${stateStyles[state]} ${widthStyle} ${className}`.trim();

        return (
            <textarea
                ref={ref}
                rows={rows}
                disabled={disabled}
                className={combinedClassName}
                {...props}
            />
        );
    }
);

Textarea.displayName = 'Textarea';
