import React from 'react';
import { Shield, Lock, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const TrustHeader: React.FC = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="bg-white border-b border-gray-200 h-16 fixed w-full top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 h-full flex justify-between items-center">
                {/* Left: Brand & Security */}
                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="bg-trust-blue p-1.5 rounded-lg">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-trust-blue font-bold text-lg tracking-tight">TaxApp</span>
                    </div>

                    <div className="flex items-center text-financial-green text-sm font-medium bg-green-50 px-3 py-1 rounded-full">
                        <Lock className="w-3 h-3 mr-1.5" />
                        Secure Connection
                    </div>
                </div>

                {/* Right: User Controls */}
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-500" />
                        </div>
                        <span className="text-sm font-medium hidden sm:block">{user?.email || 'Guest'}</span>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="text-sm text-gray-500 hover:text-trust-blue font-medium flex items-center transition-colors"
                    >
                        <LogOut className="w-4 h-4 mr-1.5" />
                        Save & Exit
                    </button>
                </div>
            </div>
        </header>
    );
};
