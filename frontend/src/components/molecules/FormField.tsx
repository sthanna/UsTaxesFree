import React from 'react';
import { Input, InputProps } from '../atoms/Input';
import { Textarea, TextareaProps } from '../atoms/Textarea';
import { Select, SelectProps } from '../atoms/Select';
import { AlertCircle } from 'lucide-react';

type BaseFieldProps = {
    /** Label for the field */
    label?: string;
    /** Field ID (auto-generated if not provided) */
    id?: string;
    /** Error message to display */
    error?: string;
    /** Help text to display below the input */
    helpText?: string;
    /** Mark field as required */
    required?: boolean;
    /** Type of input field */
    fieldType?: 'input' | 'textarea' | 'select';
};

export type FormFieldProps = BaseFieldProps & (
    | ({ fieldType?: 'input' } & InputProps)
    | ({ fieldType: 'textarea' } & TextareaProps)
    | ({ fieldType: 'select' } & SelectProps)
);

export const FormField = React.forwardRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, FormFieldProps>(
    (props, ref) => {
        const {
            label,
            id,
            error,
            helpText,
            required = false,
            fieldType = 'input',
            ...fieldProps
        } = props;

        const generatedId = id || `field-${Math.random().toString(36).substr(2, 9)}`;
        const hasError = Boolean(error);

        // Set the state based on error
        const state = hasError ? 'error' : 'default';

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={generatedId}
                        className="block text-sm font-medium text-neutral-gray-900 mb-1.5"
                    >
                        {label}
                        {required && <span className="text-alert-red-500 ml-1">*</span>}
                    </label>
                )}

                {fieldType === 'input' && (
                    <Input
                        ref={ref as React.Ref<HTMLInputElement>}
                        id={generatedId}
                        state={state}
                        {...(fieldProps as InputProps)}
                    />
                )}

                {fieldType === 'textarea' && (
                    <Textarea
                        ref={ref as React.Ref<HTMLTextAreaElement>}
                        id={generatedId}
                        state={state}
                        {...(fieldProps as TextareaProps)}
                    />
                )}

                {fieldType === 'select' && (
                    <Select
                        ref={ref as React.Ref<HTMLSelectElement>}
                        id={generatedId}
                        state={state}
                        {...(fieldProps as SelectProps)}
                    />
                )}

                {error && (
                    <div className="flex items-center mt-1.5 text-alert-red-600 text-sm">
                        <AlertCircle size={14} className="mr-1 flex-shrink-0" aria-hidden="true" />
                        <span role="alert">{error}</span>
                    </div>
                )}

                {!error && helpText && (
                    <p className="mt-1.5 text-sm text-neutral-gray-600">
                        {helpText}
                    </p>
                )}
            </div>
        );
    }
);

FormField.displayName = 'FormField';
