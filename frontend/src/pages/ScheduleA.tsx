import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '../components/atoms/Button';
import { Card } from '../components/molecules/Card';
import { CurrencyInput } from '../components/molecules/CurrencyInput';
import { Spinner } from '../components/atoms/Spinner';
import { Alert } from '../components/atoms/Alert';
import { useToast } from '../context/ToastContext';

export const ScheduleA: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        medical_expenses: 0,
        state_local_income_taxes: 0,
        real_estate_taxes: 0,
        personal_property_taxes: 0,
        mortgage_interest: 0,
        charitable_contributions_cash: 0,
        charitable_contributions_noncash: 0,
        casualty_losses: 0
    });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:3000/api/returns/${id}/schedule-a`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data) {
                const safeData = {
                    medical_expenses: Number(res.data.medical_expenses || 0),
                    state_local_income_taxes: Number(res.data.state_local_income_taxes || 0),
                    real_estate_taxes: Number(res.data.real_estate_taxes || 0),
                    personal_property_taxes: Number(res.data.personal_property_taxes || 0),
                    mortgage_interest: Number(res.data.mortgage_interest || 0),
                    charitable_contributions_cash: Number(res.data.charitable_contributions_cash || 0),
                    charitable_contributions_noncash: Number(res.data.charitable_contributions_noncash || 0),
                    casualty_losses: Number(res.data.casualty_losses || 0)
                };
                setFormData(safeData);
            }
        } catch (err) {
            console.error('Failed to fetch Schedule A', err);
            toast.showError('Failed to load Schedule A data');
        } finally {
            setLoading(false);
        }
    };

    const updateField = (field: string, value: number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:3000/api/returns/${id}/schedule-a`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.showSuccess('Schedule A saved successfully!');
            navigate(`/return/${id}`);
        } catch (err) {
            toast.showError('Failed to save Schedule A');
        } finally {
            setSaving(false);
        }
    };

    const calculateTotal = (): number => {
        return Object.values(formData).reduce((sum, val) => sum + val, 0);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-gray flex items-center justify-center">
                <Spinner size="lg" label="Loading Schedule A..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-gray">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
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
                        <h1 className="text-2xl font-bold text-neutral-gray-900">Schedule A</h1>
                        <p className="text-sm text-neutral-gray-600 mt-1">Itemized Deductions</p>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Card padding="lg" className="space-y-8">

                    {/* Medical Expenses Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-neutral-gray-900 mb-2">Medical and Dental Expenses</h3>
                        <Alert variant="info" className="mb-4">
                            Only expenses that exceed 7.5% of your AGI are deductible
                        </Alert>
                        <div>
                            <label className="block text-sm font-medium text-neutral-gray-700 mb-1">
                                Medical Expenses
                            </label>
                            <CurrencyInput
                                value={formData.medical_expenses}
                                onChange={(value) => updateField('medical_expenses', value)}
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <hr className="border-neutral-gray-200" />

                    {/* Taxes Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-neutral-gray-900 mb-2">Taxes You Paid</h3>
                        <Alert variant="warning" className="mb-4">
                            State and local taxes are generally limited to $10,000
                        </Alert>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-gray-700 mb-1">
                                    State and Local Income Taxes
                                </label>
                                <CurrencyInput
                                    value={formData.state_local_income_taxes}
                                    onChange={(value) => updateField('state_local_income_taxes', value)}
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-gray-700 mb-1">
                                    Real Estate Taxes
                                </label>
                                <CurrencyInput
                                    value={formData.real_estate_taxes}
                                    onChange={(value) => updateField('real_estate_taxes', value)}
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-gray-700 mb-1">
                                    Personal Property Taxes
                                </label>
                                <CurrencyInput
                                    value={formData.personal_property_taxes}
                                    onChange={(value) => updateField('personal_property_taxes', value)}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>

                    <hr className="border-neutral-gray-200" />

                    {/* Interest Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-neutral-gray-900 mb-2">Interest You Paid</h3>
                        <div>
                            <label className="block text-sm font-medium text-neutral-gray-700 mb-1">
                                Home Mortgage Interest
                            </label>
                            <CurrencyInput
                                value={formData.mortgage_interest}
                                onChange={(value) => updateField('mortgage_interest', value)}
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <hr className="border-neutral-gray-200" />

                    {/* Charity Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-neutral-gray-900 mb-2">Gifts to Charity</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-gray-700 mb-1">
                                    Gifts by Cash or Check
                                </label>
                                <CurrencyInput
                                    value={formData.charitable_contributions_cash}
                                    onChange={(value) => updateField('charitable_contributions_cash', value)}
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-gray-700 mb-1">
                                    Other than Cash or Check
                                </label>
                                <CurrencyInput
                                    value={formData.charitable_contributions_noncash}
                                    onChange={(value) => updateField('charitable_contributions_noncash', value)}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>

                    <hr className="border-neutral-gray-200" />

                    {/* Casualty Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-neutral-gray-900 mb-2">Casualty and Theft Losses</h3>
                        <div>
                            <label className="block text-sm font-medium text-neutral-gray-700 mb-1">
                                Federally Declared Disaster Losses
                            </label>
                            <CurrencyInput
                                value={formData.casualty_losses}
                                onChange={(value) => updateField('casualty_losses', value)}
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {/* Total and Save Section */}
                    <Card padding="md" className="bg-trust-blue-50 border border-trust-blue-200">
                        <div className="flex justify-between items-center">
                            <div className="text-lg font-semibold text-trust-blue-900">
                                Total Itemized Deductions: ${calculateTotal().toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                            <Button
                                onClick={handleSave}
                                variant="primary"
                                size="md"
                                leftIcon={Save}
                                loading={saving}
                                disabled={saving}
                            >
                                Save Schedule A
                            </Button>
                        </div>
                    </Card>
                </Card>
            </main>
        </div>
    );
};
