import React from 'react';
import { Check } from 'lucide-react';

export type CheckboxSize = 'sm' | 'md' | 'lg';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
    /** Size of the checkbox */
    size?: CheckboxSize;
    /** Label text for the checkbox */
    label?: string;
    /** Optional description text */
    description?: string;
}

const sizeStyles: Record<CheckboxSize, { box: string; label: string; icon: number }> = {
    sm: { box: 'w-4 h-4', label: 'text-sm', icon: 12 },
    md: { box: 'w-5 h-5', label: 'text-base', icon: 14 },
    lg: { box: 'w-6 h-6', label: 'text-lg', icon: 16 }
};

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
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
        const generatedId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
        const styles = sizeStyles[size];

        return (
            <div className={`flex items-start ${className}`.trim()}>
                <div className="flex items-center h-6">
                    <div className="relative">
                        <input
                            ref={ref}
                            type="checkbox"
                            id={generatedId}
                            disabled={disabled}
                            className="peer sr-only"
                            {...props}
                        />
                        <div
                            className={`
                                ${styles.box}
                                border-2 border-neutral-gray-300 rounded-md bg-white
                                peer-checked:bg-trust-blue-500 peer-checked:border-trust-blue-500
                                peer-focus-visible:ring-2 peer-focus-visible:ring-trust-blue-500 peer-focus-visible:ring-offset-2
                                peer-disabled:bg-neutral-gray-100 peer-disabled:border-neutral-gray-200 peer-disabled:cursor-not-allowed
                                transition-all duration-200 cursor-pointer
                                flex items-center justify-center
                            `}
                        >
                            <Check
                                className="text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200"
                                size={styles.icon}
                                aria-hidden="true"
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

Checkbox.displayName = 'Checkbox';
