import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { Lock, Mail, User, Shield } from 'lucide-react';
import { Button } from '../components/atoms/Button';
import { FormField } from '../components/molecules/FormField';
import { Alert } from '../components/atoms/Alert';

export const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            const errorMsg = 'Passwords do not match';
            setError(errorMsg);
            toast.showError(errorMsg);
            return;
        }

        if (formData.password.length < 6) {
            const errorMsg = 'Password must be at least 6 characters';
            setError(errorMsg);
            toast.showError(errorMsg);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:3000/api/auth/register', {
                email: formData.email,
                password: formData.password,
                first_name: formData.firstName,
                last_name: formData.lastName,
            });
            const { user, token } = response.data;
            login(token, user);
            toast.showSuccess('Account created successfully!', 'Welcome to TaxApp');
            navigate('/onboarding');
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Failed to register';
            setError(errorMessage);
            toast.showError(errorMessage, 'Registration Failed');
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
                    Create your account
                </h2>
                <p className="mt-2 text-center text-sm text-neutral-gray-600">
                    Or{' '}
                    <Link to="/login" className="font-medium text-trust-blue-600 hover:text-trust-blue-700 transition-colors">
                        sign in to your existing account
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-lg rounded-xl sm:px-10">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {error && (
                            <Alert variant="error" closable onClose={() => setError('')}>
                                {error}
                            </Alert>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                label="First Name"
                                fieldType="input"
                                type="text"
                                id="firstName"
                                name="firstName"
                                required
                                leftIcon={User}
                                placeholder="John"
                                value={formData.firstName}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            <FormField
                                label="Last Name"
                                fieldType="input"
                                type="text"
                                id="lastName"
                                name="lastName"
                                required
                                leftIcon={User}
                                placeholder="Doe"
                                value={formData.lastName}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>

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
                            value={formData.email}
                            onChange={handleChange}
                            disabled={loading}
                        />

                        <FormField
                            label="Password"
                            fieldType="input"
                            type="password"
                            id="password"
                            name="password"
                            autoComplete="new-password"
                            required
                            leftIcon={Lock}
                            placeholder="At least 6 characters"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={loading}
                            helpText="Must be at least 6 characters long"
                        />

                        <FormField
                            label="Confirm Password"
                            fieldType="input"
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            autoComplete="new-password"
                            required
                            leftIcon={Lock}
                            placeholder="Re-enter your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            disabled={loading}
                        />

                        <div className="pt-2">
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                fullWidth
                                loading={loading}
                                disabled={loading}
                            >
                                Create account
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
                                    By creating an account, you agree to our Terms
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
