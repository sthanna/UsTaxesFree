import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastContainer, ToastProps, ToastVariant, ToastPosition } from '../components/molecules/Toast';

interface ToastContextType {
    showToast: (message: string, options?: Partial<Omit<ToastProps, 'id' | 'onClose'>>) => void;
    showSuccess: (message: string, title?: string) => void;
    showError: (message: string, title?: string) => void;
    showWarning: (message: string, title?: string) => void;
    showInfo: (message: string, title?: string) => void;
    removeToast: (id: string) => void;
    removeAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export interface ToastProviderProps {
    /** Children components */
    children: React.ReactNode;
    /** Position of toast container */
    position?: ToastPosition;
    /** Maximum number of toasts to display */
    maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
    children,
    position = 'top-right',
    maxToasts = 5
}) => {
    const [toasts, setToasts] = useState<ToastProps[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback((
        message: string,
        options?: Partial<Omit<ToastProps, 'id' | 'onClose'>>
    ) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const newToast: ToastProps = {
            id,
            message,
            variant: options?.variant || 'info',
            title: options?.title,
            duration: options?.duration !== undefined ? options.duration : 5000,
            onClose: () => removeToast(id)
        };

        setToasts((prev) => {
            const updated = [...prev, newToast];
            // Limit number of toasts
            if (updated.length > maxToasts) {
                return updated.slice(-maxToasts);
            }
            return updated;
        });
    }, [maxToasts, removeToast]);

    const showSuccess = useCallback((message: string, title?: string) => {
        showToast(message, { variant: 'success', title });
    }, [showToast]);

    const showError = useCallback((message: string, title?: string) => {
        showToast(message, { variant: 'error', title, duration: 7000 });
    }, [showToast]);

    const showWarning = useCallback((message: string, title?: string) => {
        showToast(message, { variant: 'warning', title });
    }, [showToast]);

    const showInfo = useCallback((message: string, title?: string) => {
        showToast(message, { variant: 'info', title });
    }, [showToast]);

    const removeAllToasts = useCallback(() => {
        setToasts([]);
    }, []);

    return (
        <ToastContext.Provider
            value={{
                showToast,
                showSuccess,
                showError,
                showWarning,
                showInfo,
                removeToast,
                removeAllToasts
            }}
        >
            {children}
            <ToastContainer toasts={toasts} position={position} />
        </ToastContext.Provider>
    );
};

export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
