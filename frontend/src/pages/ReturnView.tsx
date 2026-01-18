import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, FileText, Edit, Calculator } from 'lucide-react';
import { Button } from '../components/atoms/Button';
import { Card } from '../components/molecules/Card';
import { Badge } from '../components/atoms/Badge';
import { Spinner } from '../components/atoms/Spinner';
import { useToast } from '../context/ToastContext';

interface TaxReturn {
    id: number;
    tax_year: number;
    filing_status: string;
    status: string;
}

export const ReturnView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useToast();
    const [taxReturn, setTaxReturn] = useState<TaxReturn | null>(null);
    const [loading, setLoading] = useState(true);
    const [calculating, setCalculating] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState('');
    const [calculationResult, setCalculationResult] = useState<any>(null);

    useEffect(() => {
        fetchReturn();
    }, [id]);

    const fetchReturn = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/api/returns/${id}`);
            setTaxReturn(response.data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch return');
        } finally {
            setLoading(false);
        }
    };

    const handleCalculate = async () => {
        try {
            setCalculating(true);
            const res = await axios.post(`http://localhost:3000/api/returns/${id}/calculate`);
            setCalculationResult(res.data);
            toast.showSuccess('Tax calculation completed!');
        } catch (err) {
            toast.showError('Calculation failed');
        } finally {
            setCalculating(false);
        }
    };

    const handleDownloadPdf = async () => {
        try {
            setDownloading(true);
            const response = await axios.get(`http://localhost:3000/api/pdf/${id}/download`, {
                responseType: 'blob',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `return_${id}_${taxReturn?.tax_year}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.showSuccess('PDF downloaded successfully!');
        } catch (err) {
            console.error('Download failed', err);
            toast.showError('Failed to download PDF');
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-gray flex items-center justify-center">
                <Spinner size="lg" label="Loading return..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-neutral-gray flex items-center justify-center">
                <Card padding="lg" className="text-center">
                    <p className="text-alert-red-600">Error: {error}</p>
                </Card>
            </div>
        );
    }

    if (!taxReturn) {
        return (
            <div className="min-h-screen bg-neutral-gray flex items-center justify-center">
                <Card padding="lg" className="text-center">
                    <p className="text-neutral-gray-600">Return not found</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-gray">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <Button
                            onClick={() => navigate('/dashboard')}
                            variant="ghost"
                            size="sm"
                            leftIcon={ArrowLeft}
                        >
                            Dashboard
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-gray-900">
                                {taxReturn.tax_year} Tax Return
                            </h1>
                            <Badge variant="primary" className="mt-1">
                                {taxReturn.status}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Button
                            onClick={() => navigate(`/return/${id}/forms`)}
                            variant="secondary"
                            size="md"
                            leftIcon={Edit}
                        >
                            Edit Forms
                        </Button>
                        <Button
                            onClick={handleCalculate}
                            variant="primary"
                            size="md"
                            leftIcon={Calculator}
                            loading={calculating}
                            disabled={calculating}
                        >
                            Calculate Tax
                        </Button>
                        <Button
                            onClick={handleDownloadPdf}
                            variant="secondary"
                            size="md"
                            leftIcon={FileText}
                            loading={downloading}
                            disabled={downloading}
                        >
                            Download PDF
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-neutral-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            { label: 'Edit W-2s & 1099s', path: `/return/${id}/forms` },
                            { label: 'Schedule 1: Additional Income', path: `/return/${id}/schedule1` },
                            { label: 'Manage Dependents', path: `/return/${id}/dependents` },
                            { label: 'Tax Payments', path: `/return/${id}/payments` },
                            { label: 'Itemized Deductions (Sch A)', path: `/return/${id}/schedule-a` },
                        ].map((action, index) => (
                            <Button
                                key={index}
                                onClick={() => navigate(action.path)}
                                variant="secondary"
                                size="md"
                                fullWidth
                                className="justify-center"
                            >
                                {action.label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Filing Information */}
                <Card padding="lg" className="mb-8">
                    <h3 className="text-lg font-semibold text-neutral-gray-900 mb-4">Filing Information</h3>
                    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <dt className="text-sm font-medium text-neutral-gray-500">Filing Status</dt>
                            <dd className="mt-1 text-base font-semibold text-neutral-gray-900">
                                {taxReturn.filing_status}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-neutral-gray-500">Tax Year</dt>
                            <dd className="mt-1 text-base font-semibold text-neutral-gray-900">
                                {taxReturn.tax_year}
                            </dd>
                        </div>
                    </dl>
                </Card>

                {/* Calculation Result */}
                {calculationResult && (
                    <Card padding="lg">
                        <h3 className="text-lg font-semibold text-neutral-gray-900 mb-4">Form 1040 Calculation Result</h3>
                        <div className="space-y-2">
                            {calculationResult.lines.map((line: any) => (
                                <div key={line.id} className="flex justify-between items-center py-2 border-b border-neutral-gray-100">
                                    <span className="text-sm text-neutral-gray-700">
                                        {line.lineNumber}: {line.description}
                                    </span>
                                    <span className="text-sm font-mono font-semibold text-neutral-gray-900">
                                        ${line.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            ))}
                            <div className="flex justify-between items-center pt-4 border-t-2 border-neutral-gray-300">
                                <span className="text-lg font-bold text-neutral-gray-900">
                                    {calculationResult.amountOwed > 0 ? 'Amount Owed' : 'Refund Amount'}
                                </span>
                                <span className={`text-2xl font-bold ${calculationResult.amountOwed > 0 ? 'text-alert-red-600' : 'text-financial-green-600'}`}>
                                    ${Math.max(calculationResult.amountOwed, calculationResult.refund).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </Card>
                )}
            </main>
        </div>
    );
};
