import React from 'react';
import { CheckCircle, Circle, Briefcase, DollarSign, FileText, Home } from 'lucide-react';

interface NavigationSidebarProps {
    currentStep: string;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({ currentStep }) => {
    const steps = [
        { id: 'personal', label: 'Personal Info', icon: <Home className="w-4 h-4" /> },
        { id: 'income', label: 'Income', icon: <DollarSign className="w-4 h-4" /> },
        { id: 'deductions', label: 'Deductions', icon: <FileText className="w-4 h-4" /> },
        { id: 'review', label: 'Review', icon: <Briefcase className="w-4 h-4" /> },
    ];

    return (
        <nav className="space-y-1">
            {steps.map((step, index) => {
                const isActive = step.id === currentStep;
                const isCompleted = index < steps.findIndex(s => s.id === currentStep);

                return (
                    <div
                        key={step.id}
                        className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-md cursor-pointer transition-colors ${isActive
                                ? 'bg-blue-50 text-trust-blue'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                    >
                        <div className={`flex-shrink-0 mr-3 ${isActive ? 'text-trust-blue' : isCompleted ? 'text-financial-green' : 'text-gray-400'
                            }`}>
                            {isCompleted ? (
                                <CheckCircle className="w-5 h-5" />
                            ) : isActive ? (
                                <div className="w-5 h-5 border-2 border-trust-blue rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-trust-blue rounded-full" />
                                </div>
                            ) : (
                                <Circle className="w-5 h-5" />
                            )}
                        </div>
                        <span className="truncate">{step.label}</span>
                    </div>
                );
            })}
        </nav>
    );
};
