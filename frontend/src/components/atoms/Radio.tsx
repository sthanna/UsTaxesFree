import React from 'react';

export type RadioSize = 'sm' | 'md' | 'lg';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
    /** Size of the radio button */
    size?: RadioSize;
    /** Label text for the radio button */
    label?: string;
    /** Optional description text */
    description?: string;
}

const sizeStyles: Record<RadioSize, { box: string; dot: string; label: string }> = {
    sm: { box: 'w-4 h-4', dot: 'w-2 h-2', label: 'text-sm' },
    md: { box: 'w-5 h-5', dot: 'w-2.5 h-2.5', label: 'text-base' },
    lg: { box: 'w-6 h-6', dot: 'w-3 h-3', label: 'text-lg' }
};

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
    (
        {
            size = 'md',
            label,
            description,
            disabled,
            className = '',
            id,
            ...props
        },
        ref
    ) => {
        const generatedId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;
        const styles = sizeStyles[size];

        return (
            <div className={`flex items-start ${className}`.trim()}>
                <div className="flex items-center h-6">
                    <div className="relative">
                        <input
                            ref={ref}
                            type="radio"
                            id={generatedId}
                            disabled={disabled}
                            className="peer sr-only"
                            {...props}
                        />
                        <div
                            className={`
                                ${styles.box}
                                border-2 border-neutral-gray-300 rounded-full bg-white
                                peer-checked:border-trust-blue-500
                                peer-focus-visible:ring-2 peer-focus-visible:ring-trust-blue-500 peer-focus-visible:ring-offset-2
                                peer-disabled:bg-neutral-gray-100 peer-disabled:border-neutral-gray-200 peer-disabled:cursor-not-allowed
                                transition-all duration-200 cursor-pointer
                                flex items-center justify-center
                            `}
                        >
                            <div
                                className={`
                                    ${styles.dot}
                                    bg-trust-blue-500 rounded-full
                                    opacity-0 peer-checked:opacity-100
                                    transition-opacity duration-200
                                `}
                            />
                        </div>
                    </div>
                </div>

                {(label || description) && (
                    <div className="ml-3">
                        {label && (
                            <label
                                htmlFor={generatedId}
                                className={`
                                    ${styles.label}
                                    font-medium text-neutral-gray-900 cursor-pointer
                                    ${disabled ? 'text-neutral-gray-400 cursor-not-allowed' : ''}
                                `}
                            >
                                {label}
                            </label>
                        )}
                        {description && (
                            <p className="text-sm text-neutral-gray-600 mt-0.5">
                                {description}
                            </p>
                        )}
                    </div>
                )}
            </div>
        );
    }
);

Radio.displayName = 'Radio';
