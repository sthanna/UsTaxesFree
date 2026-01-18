import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, User, Mail, Shield, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/atoms/Button';
import { Card } from '../components/molecules/Card';
import { Badge } from '../components/atoms/Badge';

export const Profile: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-neutral-gray">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center">
                        <Button
                            onClick={() => navigate('/dashboard')}
                            variant="ghost"
                            size="sm"
                            leftIcon={ArrowLeft}
                            className="mr-4"
                        >
                            Dashboard
                        </Button>
                        <h1 className="text-2xl font-bold text-neutral-gray-900">User Profile</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Card padding="none">
                    <div className="px-6 py-5 border-b border-neutral-gray-200">
                        <div className="flex items-center space-x-4">
                            <div className="bg-trust-blue-100 w-16 h-16 rounded-full flex items-center justify-center">
                                <User className="h-8 w-8 text-trust-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-neutral-gray-900">Personal Information</h3>
                                <p className="text-sm text-neutral-gray-600">Your account details</p>
                            </div>
                        </div>
                    </div>

                    <div className="divide-y divide-neutral-gray-200">
                        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="flex items-center space-x-2">
                                <User className="h-5 w-5 text-neutral-gray-400" />
                                <dt className="text-sm font-medium text-neutral-gray-500">Full name</dt>
                            </div>
                            <dd className="text-sm font-semibold text-neutral-gray-900 sm:col-span-2">
                                {user?.first_name} {user?.last_name}
                            </dd>
                        </div>

                        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="flex items-center space-x-2">
                                <Mail className="h-5 w-5 text-neutral-gray-400" />
                                <dt className="text-sm font-medium text-neutral-gray-500">Email address</dt>
                            </div>
                            <dd className="text-sm font-semibold text-neutral-gray-900 sm:col-span-2">
                                {user?.email}
                            </dd>
                        </div>

                        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="flex items-center space-x-2">
                                <Shield className="h-5 w-5 text-neutral-gray-400" />
                                <dt className="text-sm font-medium text-neutral-gray-500">Role</dt>
                            </div>
                            <dd className="text-sm sm:col-span-2">
                                <Badge variant="primary">{user?.role}</Badge>
                            </dd>
                        </div>

                        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <dt className="text-sm font-medium text-neutral-gray-500">Account ID</dt>
                            <dd className="text-sm font-mono text-neutral-gray-700 sm:col-span-2">
                                {user?.id}
                            </dd>
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-neutral-gray-50 border-t border-neutral-gray-200 flex justify-end">
                        <Button
                            onClick={handleLogout}
                            variant="danger"
                            size="md"
                            leftIcon={LogOut}
                        >
                            Logout
                        </Button>
                    </div>
                </Card>
            </main>
        </div>
    );
};
