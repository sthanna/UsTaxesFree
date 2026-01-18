import React, { useEffect } from 'react';
import { X, CheckCircle, Info, AlertTriangle, XCircle } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface ToastProps {
    /** Unique ID */
    id: string;
    /** Toast variant */
    variant?: ToastVariant;
    /** Toast message */
    message: string;
    /** Toast title */
    title?: string;
    /** Duration in ms (0 for persistent) */
    duration?: number;
    /** Close handler */
    onClose: () => void;
}

const variantConfig: Record<ToastVariant, { bg: string; border: string; text: string; icon: React.FC<{ size: number; className?: string }> }> = {
    success: {
        bg: 'bg-financial-green-50',
        border: 'border-financial-green-500',
        text: 'text-financial-green-900',
        icon: CheckCircle
    },
    error: {
        bg: 'bg-alert-red-50',
        border: 'border-alert-red-500',
        text: 'text-alert-red-900',
        icon: XCircle
    },
    warning: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-500',
        text: 'text-yellow-900',
        icon: AlertTriangle
    },
    info: {
        bg: 'bg-blue-50',
        border: 'border-blue-500',
        text: 'text-blue-900',
        icon: Info
    }
};

export const Toast: React.FC<ToastProps> = ({
    id,
    variant = 'info',
    message,
    title,
    duration = 5000,
    onClose
}) => {
    const config = variantConfig[variant];
    const Icon = config.icon;

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    return (
        <div
            className={`
                ${config.bg} ${config.text}
                border-l-4 ${config.border}
                rounded-lg shadow-lg p-4 mb-3
                animate-in slide-in-from-right duration-300
                flex items-start gap-3 min-w-[320px] max-w-md
            `}
            role="alert"
        >
            <div className="flex-shrink-0 mt-0.5">
                <Icon size={20} aria-hidden="true" />
            </div>

            <div className="flex-1 min-w-0">
                {title && (
                    <p className="text-sm font-semibold mb-1">{title}</p>
                )}
                <p className="text-sm">{message}</p>
            </div>

            <button
                type="button"
                onClick={onClose}
                className="flex-shrink-0 text-current hover:opacity-75 transition-opacity focus:outline-none focus:ring-2 focus:ring-trust-blue-500 rounded"
                aria-label="Close notification"
            >
                <X size={18} aria-hidden="true" />
            </button>
        </div>
    );
};

Toast.displayName = 'Toast';


// Toast Container
export interface ToastContainerProps {
    /** Position of toast container */
    position?: ToastPosition;
    /** Toasts to display */
    toasts: ToastProps[];
}

const positionStyles: Record<ToastPosition, string> = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
};

export const ToastContainer: React.FC<ToastContainerProps> = ({
    position = 'top-right',
    toasts
}) => {
    if (toasts.length === 0) return null;

    return (
        <div
            className={`fixed ${positionStyles[position]} z-tooltip`}
            style={{ zIndex: 'var(--z-tooltip)' }}
        >
            {toasts.map((toast) => (
                <Toast key={toast.id} {...toast} />
            ))}
        </div>
    );
};

ToastContainer.displayName = 'ToastContainer';
