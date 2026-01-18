import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '../components/atoms/Button';
import { Card } from '../components/molecules/Card';
import { FormField } from '../components/molecules/FormField';
import { CurrencyInput } from '../components/molecules/CurrencyInput';
import { SSNInput } from '../components/molecules/SSNInput';
import { Spinner } from '../components/atoms/Spinner';
import { useToast } from '../context/ToastContext';

interface Schedule1Data {
    additionalIncome: {
        taxable_refunds_credits?: number;
        alimony_received?: number;
        business_income?: number;
        other_gains_losses?: number;
        rental_income?: number;
        farm_income?: number;
        unemployment_compensation?: number;
        other_income_description?: string;
        other_income_amount?: number;
    };
    adjustments: {
        educator_expenses?: number;
        business_expenses?: number;
        health_savings_account?: number;
        moving_expenses?: number;
        self_employment_sep?: number;
        self_employment_health?: number;
        penalty_early_withdrawal?: number;
        alimony_paid?: number;
        alimony_recipients_ssn?: string;
        ira_deduction?: number;
        student_loan_interest?: number;
        tuition_fees?: number;
        other_adjustments_description?: string;
        other_adjustments_amount?: number;
    };
}

export const Schedule1: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState<'income' | 'adjustments' | null>(null);
    const [activeTab, setActiveTab] = useState<'income' | 'adjustments'>('income');
    const [data, setData] = useState<Schedule1Data>({
        additionalIncome: {},
        adjustments: {},
    });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [incomeRes, adjustmentsRes] = await Promise.all([
                axios.get(`http://localhost:3000/api/schedule1/${id}/additional-income`),
                axios.get(`http://localhost:3000/api/schedule1/${id}/adjustments`),
            ]);
            setData({
                additionalIncome: incomeRes.data,
                adjustments: adjustmentsRes.data,
            });
        } catch (err) {
            console.error('Failed to fetch Schedule 1 data', err);
            toast.showError('Failed to load Schedule 1 data');
        } finally {
            setLoading(false);
        }
    };

    const updateIncome = (field: string, value: string | number) => {
        setData({
            ...data,
            additionalIncome: {
                ...data.additionalIncome,
                [field]: value,
            },
        });
    };

    const updateAdjustments = (field: string, value: string | number) => {
        setData({
            ...data,
            adjustments: {
                ...data.adjustments,
                [field]: value,
            },
        });
    };

    const saveIncome = async () => {
        try {
            setSaving('income');
            await axios.post(`http://localhost:3000/api/schedule1/${id}/additional-income`, data.additionalIncome);
            toast.showSuccess('Additional income saved successfully!');
        } catch (err) {
            toast.showError('Failed to save additional income');
        } finally {
            setSaving(null);
        }
    };

    const saveAdjustments = async () => {
        try {
            setSaving('adjustments');
            await axios.post(`http://localhost:3000/api/schedule1/${id}/adjustments`, data.adjustments);
            toast.showSuccess('Adjustments saved successfully!');
        } catch (err) {
            toast.showError('Failed to save adjustments');
        } finally {
            setSaving(null);
        }
    };

    const calculateTotal = (section: 'income' | 'adjustments'): number => {
        const values = section === 'income'
            ? Object.values(data.additionalIncome)
            : Object.values(data.adjustments);

        return values.reduce((sum: number, val: unknown) => {
            if (typeof val === 'number') {
                return sum + val;
            }
            return sum;
        }, 0);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-gray flex items-center justify-center">
                <Spinner size="lg" label="Loading Schedule 1..." />
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
                        <h1 className="text-2xl font-bold text-neutral-gray-900">Schedule 1</h1>
                        <p className="text-sm text-neutral-gray-600 mt-1">Additional Income and Adjustments to Income</p>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Card padding="none">
                    <div className="border-b border-neutral-gray-200">
                        <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                            {[
                                { key: 'income', label: 'Additional Income (Part I)' },
                                { key: 'adjustments', label: 'Adjustments to Income (Part II)' },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key as any)}
                                    className={`${activeTab === tab.key
                                        ? 'border-trust-blue-500 text-trust-blue-600'
                                        : 'border-transparent text-neutral-gray-500 hover:text-neutral-gray-700 hover:border-neutral-gray-300'
                                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-6">
                        {/* Additional Income Tab */}
                        {activeTab === 'income' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-gray-700 mb-1">
                                            Line 1: Taxable refunds, credits, or offsets
                                        </label>
                                        <CurrencyInput
                                            value={data.additionalIncome.taxable_refunds_credits || 0}
                                            onChange={(value) => updateIncome('taxable_refunds_credits', value)}
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-neutral-gray-700 mb-1">
                                            Line 2a: Alimony received
                                        </label>
                                        <CurrencyInput
                                            value={data.additionalIncome.alimony_received || 0}
                                            onChange={(value) => updateIncome('alimony_received', value)}
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-neutral-gray-700 mb-1">
                                            Line 3: Business income or loss
                                        </label>
                                        <CurrencyInput
                                            value={data.additionalIncome.business_income || 0}
                                            onChange={(value) => updateIncome('business_income', value)}
                                            placeholder="0.00"
                                            allowNegative
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-neutral-gray-700 mb-1">
                                            Line 4: Other gains or losses
                                        </label>
                                        <CurrencyInput
                                            value={data.additionalIncome.other_gains_losses || 0}
                                            onChange={(value) => updateIncome('other_gains_losses', value)}
                                            placeholder="0.00"
                                            allowNegative
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-neutral-gray-700 mb-1">
                                            Line 5: Rental real estate, royalties, etc.
                                        </label>
                                        <CurrencyInput
                                            value={data.additionalIncome.rental_income || 0}
                                            onChange={(value) => updateIncome('rental_income', value)}
                                            placeholder="0.00"
                                            allowNegative
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-neutral-gray-700 mb-1">
                                            Line 6: Farm income or loss
                                        </label>
                                        <CurrencyInput
                                            value={data.additionalIncome.farm_income || 0}
                                            onChange={(value) => updateIncome('farm_income', value)}
                                            placeholder="0.00"
                                            allowNegative
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-neutral-gray-700 mb-1">
                                            Line 7: Unemployment compensation
                                        </label>
                                        <CurrencyInput
                                            value={data.additionalIncome.unemployment_compensation || 0}
                                            onChange={(value) => updateIncome('unemployment_compensation', value)}
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <FormField
                                            label="Line 8z: Other income (description)"
                                            fieldType="input"
                                            type="text"
                                            value={data.additionalIncome.other_income_description || ''}
                                            onChange={(e) => updateIncome('other_income_description', e.target.value)}
                                            placeholder="e.g., gambling winnings, prizes, awards"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-neutral-gray-700 mb-1">
                                            Line 8z: Other income (amount)
                                        </label>
                                        <CurrencyInput
                                            value={data.additionalIncome.other_income_amount || 0}
                                            onChange={(value) => updateIncome('other_income_amount', value)}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <Card padding="md" className="bg-trust-blue-50 border border-trust-blue-200">
                                    <div className="flex justify-between items-center">
                                        <div className="text-lg font-semibold text-trust-blue-900">
                                            Total Additional Income: ${calculateTotal('income').toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </div>
                                        <Button
                                            onClick={saveIncome}
                                            variant="primary"
                                            size="md"
                                            leftIcon={Save}
                                            loading={saving === 'income'}
                                            disabled={saving === 'income'}
                                        >
                                            Save Additional Income
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {/* Adjustments Tab */}
                        {activeTab === 'adjustments' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-gray-700 mb-1">
                                            Line 11: Educator expenses
                                        </label>
                                        <CurrencyInput
                                            value={data.adjustments.educator_expenses || 0}
                                            onChange={(value) => updateAdjustments('educator_expenses', value)}
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-neutral-gray-700 mb-1">
                                            Line 13: Health savings account deduction
                                        </label>
                                        <CurrencyInput
                                            value={data.adjustments.health_savings_account || 0}
                                            onChange={(value) => updateAdjustments('health_savings_account', value)}
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-neutral-gray-700 mb-1">
                                            Line 15: Self-employed SEP, SIMPLE, etc.
                                        </label>
                                        <CurrencyInput
                                            value={data.adjustments.self_employment_sep || 0}
                                            onChange={(value) => updateAdjustments('self_employment_sep', value)}
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-neutral-gray-700 mb-1">
                                            Line 16: Self-employed health insurance
                                        </label>
                                        <CurrencyInput
                                            value={data.adjustments.self_employment_health || 0}
                                            onChange={(value) => updateAdjustments('self_employment_health', value)}
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-neutral-gray-700 mb-1">
                                            Line 18a: Alimony paid
                                        </label>
                                        <CurrencyInput
                                            value={data.adjustments.alimony_paid || 0}
                                            onChange={(value) => updateAdjustments('alimony_paid', value)}
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-neutral-gray-700 mb-1">
                                            Line 18b: Recipient's SSN
                                        </label>
                                        <SSNInput
                                            value={data.adjustments.alimony_recipients_ssn || ''}
                                            onChange={(value) => updateAdjustments('alimony_recipients_ssn', value)}
                                            placeholder="XXX-XX-XXXX"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-neutral-gray-700 mb-1">
                                            Line 19: IRA deduction
                                        </label>
                                        <CurrencyInput
                                            value={data.adjustments.ira_deduction || 0}
                                            onChange={(value) => updateAdjustments('ira_deduction', value)}
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-neutral-gray-700 mb-1">
                                            Line 20: Student loan interest deduction
                                        </label>
                                        <CurrencyInput
                                            value={data.adjustments.student_loan_interest || 0}
                                            onChange={(value) => updateAdjustments('student_loan_interest', value)}
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <FormField
                                            label="Line 24z: Other adjustments (description)"
                                            fieldType="input"
                                            type="text"
                                            value={data.adjustments.other_adjustments_description || ''}
                                            onChange={(e) => updateAdjustments('other_adjustments_description', e.target.value)}
                                            placeholder="Describe other adjustments"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-neutral-gray-700 mb-1">
                                            Line 24z: Other adjustments (amount)
                                        </label>
                                        <CurrencyInput
                                            value={data.adjustments.other_adjustments_amount || 0}
                                            onChange={(value) => updateAdjustments('other_adjustments_amount', value)}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <Card padding="md" className="bg-financial-green-50 border border-financial-green-200">
                                    <div className="flex justify-between items-center">
                                        <div className="text-lg font-semibold text-financial-green-900">
                                            Total Adjustments: ${calculateTotal('adjustments').toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </div>
                                        <Button
                                            onClick={saveAdjustments}
                                            variant="success"
                                            size="md"
                                            leftIcon={Save}
                                            loading={saving === 'adjustments'}
                                            disabled={saving === 'adjustments'}
                                        >
                                            Save Adjustments
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        )}
                    </div>
                </Card>
            </main>
        </div>
    );
};
