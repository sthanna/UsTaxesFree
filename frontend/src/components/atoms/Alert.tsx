import React from 'react';
import { Info, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Alert variant */
    variant?: AlertVariant;
    /** Alert title */
    title?: string;
    /** Show close button */
    closable?: boolean;
    /** Close handler */
    onClose?: () => void;
    /** Children content */
    children: React.ReactNode;
}

const variantConfig: Record<AlertVariant, { bg: string; border: string; text: string; icon: React.FC<{ size: number; className?: string }> }> = {
    info: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-900',
        icon: Info
    },
    success: {
        bg: 'bg-financial-green-50',
        border: 'border-financial-green-200',
        text: 'text-financial-green-900',
        icon: CheckCircle
    },
    warning: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-900',
        icon: AlertTriangle
    },
    error: {
        bg: 'bg-alert-red-50',
        border: 'border-alert-red-200',
        text: 'text-alert-red-900',
        icon: XCircle
    }
};

export const Alert: React.FC<AlertProps> = ({
    variant = 'info',
    title,
    closable = false,
    onClose,
    children,
    className = '',
    ...props
}) => {
    const config = variantConfig[variant];
    const Icon = config.icon;

    return (
        <div
            className={`${config.bg} ${config.border} ${config.text} border rounded-lg p-4 ${className}`.trim()}
            role="alert"
            {...props}
        >
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <Icon size={20} aria-hidden="true" />
                </div>

                <div className="ml-3 flex-1">
                    {title && (
                        <h3 className="text-sm font-semibold mb-1">{title}</h3>
                    )}
                    <div className="text-sm">{children}</div>
                </div>

                {closable && onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className={`ml-3 flex-shrink-0 inline-flex ${config.text} hover:opacity-75 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-trust-blue-500 rounded`}
                        aria-label="Close alert"
                    >
                        <X size={20} aria-hidden="true" />
                    </button>
                )}
            </div>
        </div>
    );
};

Alert.displayName = 'Alert';
