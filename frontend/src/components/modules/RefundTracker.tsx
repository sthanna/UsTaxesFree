import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const RefundTracker: React.FC = () => {
    // Mock data for now - will be connected to context/props later
    const federalAmount = 1250;
    const stateAmount = -45; // Owed

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estimated Refund</h3>
            </div>
            <div className="p-4 space-y-4">
                {/* Federal */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-600">Federal</span>
                    </div>
                    <div className={`text-lg font-bold ${federalAmount >= 0 ? 'text-financial-green' : 'text-gray-900'}`}>
                        {federalAmount >= 0 ? (
                            <span className="flex items-center">
                                <TrendingUp className="w-4 h-4 mr-1" />
                                ${federalAmount.toLocaleString()}
                            </span>
                        ) : (
                            <span>${federalAmount.toLocaleString()}</span>
                        )}
                    </div>
                </div>

                {/* State */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-600">State (NY)</span>
                    </div>
                    <div className={`text-lg font-bold ${stateAmount >= 0 ? 'text-financial-green' : 'text-gray-900'}`}>
                        {stateAmount >= 0 ? (
                            <span className="flex items-center">
                                <TrendingUp className="w-4 h-4 mr-1" />
                                ${stateAmount.toLocaleString()}
                            </span>
                        ) : (
                            <span className="flex items-center text-gray-500">
                                <TrendingDown className="w-4 h-4 mr-1" />
                                ${Math.abs(stateAmount).toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
