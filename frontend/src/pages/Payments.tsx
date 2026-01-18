import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Trash2, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/atoms/Button';
import { Card } from '../components/molecules/Card';
import { FormField } from '../components/molecules/FormField';
import { CurrencyInput } from '../components/molecules/CurrencyInput';
import { DateInput } from '../components/molecules/DateInput';
import { Spinner } from '../components/atoms/Spinner';
import { Badge } from '../components/atoms/Badge';
import { useToast } from '../context/ToastContext';
import { ConfirmDialog } from '../components/molecules/Modal';

interface TaxPayment {
    id: number;
    payment_type: string;
    payment_date: string;
    amount: number;
    description?: string;
}

export const Payments: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { token } = useAuth();
    const toast = useToast();

    const [payments, setPayments] = useState<TaxPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    // Form State
    const [amount, setAmount] = useState(0);
    const [date, setDate] = useState('');
    const [type, setType] = useState('estimated_q1');
    const [description, setDescription] = useState('');

    useEffect(() => {
        fetchPayments();
    }, [id]);

    const fetchPayments = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/api/returns/${id}/payments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPayments(response.data);
        } catch (err) {
            toast.showError('Failed to fetch payments');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setAdding(true);
            const res = await axios.post(`http://localhost:3000/api/returns/${id}/payments`, {
                amount,
                payment_date: date,
                payment_type: type,
                description
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setPayments([...payments, res.data]);
            toast.showSuccess('Payment added successfully!');
            setAmount(0);
            setDate('');
            setDescription('');
        } catch (err: any) {
            toast.showError(err.response?.data?.error || 'Failed to add payment');
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (paymentId: number) => {
        try {
            await axios.delete(`http://localhost:3000/api/returns/${id}/payments/${paymentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPayments(payments.filter(p => p.id !== paymentId));
            toast.showSuccess('Payment deleted successfully');
        } catch (err) {
            toast.showError('Failed to delete payment');
        } finally {
            setDeleteId(null);
        }
    };

    const totalPayments = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    const paymentTypes = [
        { value: 'estimated_q1', label: 'Q1 Estimated (Apr 15)' },
        { value: 'estimated_q2', label: 'Q2 Estimated (Jun 15)' },
        { value: 'estimated_q3', label: 'Q3 Estimated (Sep 15)' },
        { value: 'estimated_q4', label: 'Q4 Estimated (Jan 15)' },
        { value: 'extension', label: 'Extension Payment' },
        { value: 'other', label: 'Other/Prior Year Overpayment' },
        { value: 'withholding', label: 'Withholding (Manual)' },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-gray flex items-center justify-center">
                <Spinner size="lg" label="Loading payments..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-gray">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center">
                        <Button
                            onClick={() => navigate(`/return/${id}`)}
                            variant="ghost"
                            size="sm"
                            leftIcon={ArrowLeft}
                            className="mr-4"
                        >
                            Back
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-gray-900">Tax Payments</h1>
                            <p className="text-sm text-neutral-gray-600 mt-1">Track estimated payments and withholding</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Payment List */}
                    <div className="lg:col-span-2">
                        <Card padding="none">
                            <div className="px-6 py-5 flex justify-between items-center border-b border-neutral-gray-200">
                                <h3 className="text-lg font-semibold text-neutral-gray-900">Payment History</h3>
                                <Badge variant="success" className="text-base px-4 py-1">
                                    Total: ${totalPayments.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </Badge>
                            </div>
                            <div>
                                {payments.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <div className="bg-trust-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <DollarSign className="h-8 w-8 text-trust-blue-600" />
                                        </div>
                                        <p className="text-neutral-gray-600 mb-2">No payments recorded yet</p>
                                        <p className="text-sm text-neutral-gray-500">Add estimated tax payments or additional withholding</p>
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-neutral-gray-200">
                                        {payments.map(p => (
                                            <li key={p.id} className="px-6 py-4 hover:bg-neutral-gray-50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3 mb-1">
                                                            <p className="text-sm font-semibold text-neutral-gray-900">
                                                                {paymentTypes.find(t => t.value === p.payment_type)?.label || p.payment_type}
                                                            </p>
                                                            <Badge variant="default" className="text-xs">
                                                                {new Date(p.payment_date).toLocaleDateString()}
                                                            </Badge>
                                                        </div>
                                                        {p.description && (
                                                            <p className="text-xs text-neutral-gray-500">{p.description}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center space-x-4">
                                                        <span className="text-base font-bold text-financial-green-600">
                                                            ${Number(p.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                        </span>
                                                        <Button
                                                            onClick={() => setDeleteId(p.id)}
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-alert-red-500 hover:text-alert-red-600 hover:bg-alert-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Add Payment Form */}
                    <div className="lg:col-span-1">
                        <Card padding="lg">
                            <h3 className="text-lg font-semibold text-neutral-gray-900 mb-6">Log Payment</h3>
                            <form onSubmit={handleAdd} className="space-y-5">
                                <FormField
                                    label="Payment Type"
                                    fieldType="select"
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    required
                                >
                                    {paymentTypes.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </FormField>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-gray-700 mb-1">
                                        Payment Date <span className="text-alert-red-500">*</span>
                                    </label>
                                    <DateInput
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-gray-700 mb-1">
                                        Amount <span className="text-alert-red-500">*</span>
                                    </label>
                                    <CurrencyInput
                                        value={amount}
                                        onChange={(value) => setAmount(value)}
                                        placeholder="0.00"
                                    />
                                </div>

                                <FormField
                                    label="Description (Optional)"
                                    fieldType="input"
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Add a note..."
                                    helpText="e.g., Quarterly estimated payment"
                                />

                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    fullWidth
                                    loading={adding}
                                    disabled={adding}
                                >
                                    Add Payment
                                </Button>
                            </form>
                        </Card>
                    </div>
                </div>
            </main>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteId !== null}
                onClose={() => setDeleteId(null)}
                onConfirm={() => deleteId !== null && handleDelete(deleteId)}
                title="Delete Payment"
                message="Are you sure you want to delete this payment? This action cannot be undone."
                confirmText="Delete"
                confirmVariant="danger"
            />
        </div>
    );
};
