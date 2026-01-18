import React from 'react';
import { RefundTracker } from '../modules/RefundTracker';
import { HelpCircle } from 'lucide-react';

export const AssistantRail: React.FC = () => {
    return (
        <aside className="space-y-6">
            <RefundTracker />

            {/* Contextual Help Placeholder */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-start space-x-3">
                    <HelpCircle className="w-5 h-5 text-trust-blue flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-semibold text-trust-blue mb-1">Did you know?</h4>
                        <p className="text-sm text-blue-800 leading-relaxed">
                            Reporting your W-2 wages accurately ensures you get the maximum standard deduction available for your filing status.
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
};
