import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { Lock, Mail, Shield } from 'lucide-react';
import { Button } from '../components/atoms/Button';
import { FormField } from '../components/molecules/FormField';
import { Alert } from '../components/atoms/Alert';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:3000/api/auth/login', {
                email,
                password,
            });
            const { user, token } = response.data;
            login(token, user);
            toast.showSuccess('Welcome back!', 'Logged in successfully');
            navigate('/dashboard');
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Failed to login';
            setError(errorMessage);
            toast.showError(errorMessage, 'Login Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-gray flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                {/* Brand Logo */}
                <div className="flex justify-center mb-6">
                    <div className="flex items-center space-x-2">
                        <div className="bg-trust-blue-500 p-2 rounded-lg">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <span className="text-trust-blue-500 font-bold text-2xl tracking-tight">TaxApp</span>
                    </div>
                </div>

                <h2 className="text-center text-3xl font-bold text-neutral-gray-900">
                    Sign in to your account
                </h2>
                <p className="mt-2 text-center text-sm text-neutral-gray-600">
                    Or{' '}
                    <Link to="/register" className="font-medium text-trust-blue-600 hover:text-trust-blue-700 transition-colors">
                        create a new account
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-lg rounded-xl sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <Alert variant="error" closable onClose={() => setError('')}>
                                {error}
                            </Alert>
                        )}

                        <FormField
                            label="Email address"
                            fieldType="input"
                            type="email"
                            id="email"
                            name="email"
                            autoComplete="email"
                            required
                            leftIcon={Mail}
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />

                        <FormField
                            label="Password"
                            fieldType="input"
                            type="password"
                            id="password"
                            name="password"
                            autoComplete="current-password"
                            required
                            leftIcon={Lock}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />

                        <div>
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                fullWidth
                                loading={loading}
                                disabled={loading}
                            >
                                Sign in
                            </Button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-neutral-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-neutral-gray-500">
                                    Secure login with bank-level encryption
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
