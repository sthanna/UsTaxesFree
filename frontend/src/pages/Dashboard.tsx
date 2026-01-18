import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import { Plus, FileText, ChevronRight, TrendingUp, TrendingDown, Shield } from 'lucide-react';
import { Button } from '../components/atoms/Button';
import { Badge } from '../components/atoms/Badge';
import { Card } from '../components/molecules/Card';
import { Spinner } from '../components/atoms/Spinner';
import { Modal } from '../components/molecules/Modal';
import { FormField } from '../components/molecules/FormField';

interface TaxReturn {
    id: number;
    tax_year: number;
    filing_status: string;
    status: string;
    updated_at: string;
}

export const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const [returns, setReturns] = useState<TaxReturn[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [showNewReturnModal, setShowNewReturnModal] = useState(false);
    const [newReturnYear, setNewReturnYear] = useState('2025');

    useEffect(() => {
        fetchReturns();
    }, []);

    const fetchReturns = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/returns');
            setReturns(response.data);
        } catch (error) {
            console.error('Failed to fetch returns', error);
            toast.showError('Failed to load tax returns');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateReturn = async () => {
        setCreating(true);
        try {
            const taxYear = parseInt(newReturnYear);

            if (taxYear !== 2024 && taxYear !== 2025) {
                toast.showError('Only 2024 and 2025 are supported');
                return;
            }

            await axios.post('http://localhost:3000/api/returns', {
                taxYear,
                filingStatus: 'SINGLE',
            });
            toast.showSuccess('Tax return created successfully!');
            setShowNewReturnModal(false);
            fetchReturns();
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || 'Failed to create return (maybe one already exists for this year?)';
            toast.showError(errorMsg);
        } finally {
            setCreating(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getStatusBadgeVariant = (status: string): 'default' | 'primary' | 'success' | 'warning' => {
        switch (status.toLowerCase()) {
            case 'draft':
                return 'default';
            case 'in_progress':
                return 'primary';
            case 'completed':
                return 'success';
            case 'filed':
                return 'success';
            default:
                return 'default';
        }
    };

    return (
        <div className="min-h-screen bg-neutral-gray">
            {/* Navigation */}
            <nav className="bg-white shadow-sm border-b border-neutral-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <div className="flex items-center space-x-2">
                                <div className="bg-trust-blue-500 p-1.5 rounded-lg">
                                    <Shield className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-trust-blue-500 font-bold text-lg tracking-tight">TaxApp</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link to="/profile" className="text-neutral-gray-700 hover:text-trust-blue-600 font-medium transition-colors">
                                Welcome, {user?.first_name || user?.email}
                            </Link>
                            <Button
                                onClick={handleLogout}
                                variant="ghost"
                                size="sm"
                            >
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="py-10">
                <header>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-gray-900">Dashboard</h1>
                            <p className="mt-1 text-sm text-neutral-gray-600">Manage your tax returns</p>
                        </div>
                        <Button
                            onClick={() => setShowNewReturnModal(true)}
                            disabled={creating}
                            variant="success"
                            size="lg"
                            leftIcon={Plus}
                        >
                            Start New Return
                        </Button>
                    </div>
                </header>

                <main>
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-6">
                        <div className="px-4 py-6 sm:px-0">
                            {loading ? (
                                <div className="flex justify-center items-center h-64">
                                    <Spinner size="lg" label="Loading returns..." />
                                </div>
                            ) : returns.length === 0 ? (
                                <Card padding="lg" className="border-2 border-dashed">
                                    <div className="flex flex-col justify-center items-center text-center py-12">
                                        <div className="bg-trust-blue-100 p-4 rounded-full mb-4">
                                            <FileText className="h-12 w-12 text-trust-blue-500" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-neutral-gray-900 mb-2">
                                            No tax returns yet
                                        </h3>
                                        <p className="text-neutral-gray-600 mb-6">
                                            Get started by creating your first tax return
                                        </p>
                                        <Button
                                            onClick={() => setShowNewReturnModal(true)}
                                            variant="primary"
                                            leftIcon={Plus}
                                        >
                                            Create Your First Return
                                        </Button>
                                    </div>
                                </Card>
                            ) : (
                                <Card padding="none">
                                    <div className="divide-y divide-neutral-gray-200">
                                        {returns.map((ret) => (
                                            <Link
                                                key={ret.id}
                                                to={`/return/${ret.id}`}
                                                className="block hover:bg-neutral-gray-50 transition-colors"
                                            >
                                                <div className="px-6 py-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="bg-trust-blue-100 p-2 rounded-lg">
                                                                <FileText className="h-5 w-5 text-trust-blue-600" />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-lg font-semibold text-trust-blue-600">
                                                                    Tax Year {ret.tax_year}
                                                                </h3>
                                                                <p className="text-sm text-neutral-gray-600">
                                                                    Filing Status: {ret.filing_status}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-3">
                                                            <Badge variant={getStatusBadgeVariant(ret.status)}>
                                                                {ret.status.replace('_', ' ').toUpperCase()}
                                                            </Badge>
                                                            <ChevronRight className="h-5 w-5 text-neutral-gray-400" />
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 text-sm text-neutral-gray-500">
                                                        Last updated: {new Date(ret.updated_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </Card>
                            )}
                        </div>

                        {/* Latest Return Stats */}
                        {returns.length > 0 && (
                            <div className="px-4 sm:px-0 mt-8">
                                <h2 className="text-xl font-bold text-neutral-gray-900 mb-4">
                                    Latest Return Snapshot ({returns[0].tax_year})
                                </h2>
                                <LatestReturnStats returnId={returns[0].id} />
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* New Return Modal */}
            <Modal
                isOpen={showNewReturnModal}
                onClose={() => setShowNewReturnModal(false)}
                title="Create New Tax Return"
                size="sm"
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => setShowNewReturnModal(false)}
                            disabled={creating}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleCreateReturn}
                            loading={creating}
                            disabled={creating}
                        >
                            Create Return
                        </Button>
                    </>
                }
            >
                <FormField
                    label="Tax Year"
                    fieldType="select"
                    value={newReturnYear}
                    onChange={(e) => setNewReturnYear(e.target.value)}
                    helpText="Select the tax year for this return"
                >
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                </FormField>
            </Modal>
        </div>
    );
};

const LatestReturnStats: React.FC<{ returnId: number }> = ({ returnId }) => {
    const { token } = useAuth();
    const [stats, setStats] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        axios.post(`http://localhost:3000/api/returns/${returnId}/calculate`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setStats(res.data))
            .catch(err => console.error('Failed to load stats', err))
            .finally(() => setLoading(false));
    }, [returnId, token]);

    if (loading) {
        return (
            <Card>
                <div className="animate-pulse h-24 bg-neutral-gray-200 rounded-lg"></div>
            </Card>
        );
    }

    if (!stats) return null;

    const isRefund = stats.refund > 0;
    const amount = isRefund ? stats.refund : stats.amountOwed;

    return (
        <Card padding="lg">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                        {isRefund ? (
                            <TrendingUp className="h-6 w-6 text-financial-green-500" />
                        ) : (
                            <TrendingDown className="h-6 w-6 text-alert-red-500" />
                        )}
                        <h3 className="text-base font-medium text-neutral-gray-700">
                            {isRefund ? 'Estimated Refund' : 'Amount You Owe'}
                        </h3>
                    </div>
                    <div className={`text-3xl font-bold ${isRefund ? 'text-financial-green-600' : 'text-alert-red-600'}`}>
                        ${amount.toLocaleString()}
                    </div>
                    <div className="mt-2">
                        <Badge variant="default">{stats.filingStatus}</Badge>
                    </div>
                </div>
                <div>
                    <Link to={`/return/${returnId}`}>
                        <Button variant="ghost" size="sm" rightIcon={ChevronRight}>
                            View Details
                        </Button>
                    </Link>
                </div>
            </div>
        </Card>
    );
};
