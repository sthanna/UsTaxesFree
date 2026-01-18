import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, Save } from 'lucide-react';
import { ThreeColumnLayout } from '../components/layout/ThreeColumnLayout';
import { Button } from '../components/atoms/Button';
import { Card } from '../components/molecules/Card';
import { FormField } from '../components/molecules/FormField';
import { CurrencyInput } from '../components/molecules/CurrencyInput';
import { Spinner } from '../components/atoms/Spinner';
import { Checkbox } from '../components/atoms/Checkbox';
import { useToast } from '../context/ToastContext';

interface W2Form {
    id?: number;
    employer: string;
    wages: string;
    federalTaxWithheld: string;
}

interface Form1099INT {
    id?: number;
    payer: string;
    amount: string;
}

interface Form1099DIV {
    id?: number;
    payer: string;
    amount: string;
}

interface Form1099B {
    id?: number;
    description: string;
    proceeds: string;
    costBasis: string;
    isLongTerm: boolean;
}

export const FormInput: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState<{ [key: string]: boolean }>({});
    const [activeTab, setActiveTab] = useState<'w2' | '1099int' | '1099div' | '1099b'>('w2');

    const [w2Forms, setW2Forms] = useState<W2Form[]>([]);
    const [form1099INTs, setForm1099INTs] = useState<Form1099INT[]>([]);
    const [form1099DIVs, setForm1099DIVs] = useState<Form1099DIV[]>([]);
    const [form1099Bs, setForm1099Bs] = useState<Form1099B[]>([]);

    useEffect(() => {
        fetchForms();
    }, [id]);

    const fetchForms = async () => {
        try {
            setLoading(true);
            const [w2Res, intRes, divRes, stockRes] = await Promise.all([
                axios.get(`http://localhost:3000/api/returns/${id}/forms/w2`),
                axios.get(`http://localhost:3000/api/returns/${id}/forms/1099-int`),
                axios.get(`http://localhost:3000/api/returns/${id}/forms/1099-div`),
                axios.get(`http://localhost:3000/api/returns/${id}/forms/1099-b`),
            ]);
            setW2Forms(w2Res.data.map((f: any) => ({ ...f, wages: f.wages?.toString() || '', federalTaxWithheld: f.federal_tax_withheld?.toString() || '' })));
            setForm1099INTs(intRes.data.map((f: any) => ({ ...f, amount: f.amount?.toString() || '' })));
            setForm1099DIVs(divRes.data.map((f: any) => ({ ...f, amount: f.amount?.toString() || '' })));
            setForm1099Bs(stockRes.data.map((f: any) => ({
                ...f,
                proceeds: f.proceeds?.toString() || '',
                costBasis: f.cost_basis?.toString() || '',
                isLongTerm: f.is_long_term || false,
            })));
        } catch (err) {
            console.error('Failed to fetch forms', err);
            toast.showError('Failed to load forms');
        } finally {
            setLoading(false);
        }
    };

    const addW2 = () => {
        setW2Forms([...w2Forms, { employer: '', wages: '', federalTaxWithheld: '' }]);
    };

    const deleteW2 = async (index: number) => {
        const form = w2Forms[index];
        if (form.id) {
            try {
                await axios.delete(`http://localhost:3000/api/returns/${id}/forms/w2/${form.id}`);
                toast.showSuccess('W-2 deleted');
            } catch (err) {
                toast.showError('Failed to delete W-2');
                return;
            }
        }
        setW2Forms(w2Forms.filter((_, i) => i !== index));
    };

    const updateW2 = (index: number, field: keyof W2Form, value: string) => {
        const updated = [...w2Forms];
        updated[index] = { ...updated[index], [field]: value };
        setW2Forms(updated);
    };

    const saveW2 = async (index: number) => {
        const form = w2Forms[index];
        const savingKey = `w2-${index}`;
        try {
            setSaving(prev => ({ ...prev, [savingKey]: true }));
            if (form.id) {
                await axios.put(`http://localhost:3000/api/returns/${id}/forms/w2/${form.id}`, {
                    employer: form.employer,
                    wages: parseFloat(form.wages) || 0,
                    federalTaxWithheld: parseFloat(form.federalTaxWithheld) || 0,
                });
            } else {
                const res = await axios.post(`http://localhost:3000/api/returns/${id}/forms/w2`, {
                    employer: form.employer,
                    wages: parseFloat(form.wages) || 0,
                    federalTaxWithheld: parseFloat(form.federalTaxWithheld) || 0,
                });
                const updated = [...w2Forms];
                updated[index].id = res.data.id;
                setW2Forms(updated);
            }
            toast.showSuccess('W-2 saved successfully!');
        } catch (err) {
            toast.showError('Failed to save W-2');
        } finally {
            setSaving(prev => ({ ...prev, [savingKey]: false }));
        }
    };

    const add1099INT = () => {
        setForm1099INTs([...form1099INTs, { payer: '', amount: '' }]);
    };

    const delete1099INT = async (index: number) => {
        const form = form1099INTs[index];
        if (form.id) {
            try {
                await axios.delete(`http://localhost:3000/api/returns/${id}/forms/1099-int/${form.id}`);
                toast.showSuccess('1099-INT deleted');
            } catch (err) {
                toast.showError('Failed to delete 1099-INT');
                return;
            }
        }
        setForm1099INTs(form1099INTs.filter((_, i) => i !== index));
    };

    const update1099INT = (index: number, field: keyof Form1099INT, value: string) => {
        const updated = [...form1099INTs];
        updated[index] = { ...updated[index], [field]: value };
        setForm1099INTs(updated);
    };

    const save1099INT = async (index: number) => {
        const form = form1099INTs[index];
        const savingKey = `1099int-${index}`;
        try {
            setSaving(prev => ({ ...prev, [savingKey]: true }));
            if (form.id) {
                await axios.put(`http://localhost:3000/api/returns/${id}/forms/1099-int/${form.id}`, {
                    payer: form.payer,
                    amount: parseFloat(form.amount) || 0,
                });
            } else {
                const res = await axios.post(`http://localhost:3000/api/returns/${id}/forms/1099-int`, {
                    payer: form.payer,
                    amount: parseFloat(form.amount) || 0,
                });
                const updated = [...form1099INTs];
                updated[index].id = res.data.id;
                setForm1099INTs(updated);
            }
            toast.showSuccess('1099-INT saved successfully!');
        } catch (err) {
            toast.showError('Failed to save 1099-INT');
        } finally {
            setSaving(prev => ({ ...prev, [savingKey]: false }));
        }
    };

    const add1099DIV = () => {
        setForm1099DIVs([...form1099DIVs, { payer: '', amount: '' }]);
    };

    const delete1099DIV = async (index: number) => {
        const form = form1099DIVs[index];
        if (form.id) {
            try {
                await axios.delete(`http://localhost:3000/api/returns/${id}/forms/1099-div/${form.id}`);
                toast.showSuccess('1099-DIV deleted');
            } catch (err) {
                toast.showError('Failed to delete 1099-DIV');
                return;
            }
        }
        setForm1099DIVs(form1099DIVs.filter((_, i) => i !== index));
    };

    const update1099DIV = (index: number, field: keyof Form1099DIV, value: string) => {
        const updated = [...form1099DIVs];
        updated[index] = { ...updated[index], [field]: value };
        setForm1099DIVs(updated);
    };

    const save1099DIV = async (index: number) => {
        const form = form1099DIVs[index];
        const savingKey = `1099div-${index}`;
        try {
            setSaving(prev => ({ ...prev, [savingKey]: true }));
            if (form.id) {
                await axios.put(`http://localhost:3000/api/returns/${id}/forms/1099-div/${form.id}`, {
                    payer: form.payer,
                    amount: parseFloat(form.amount) || 0,
                });
            } else {
                const res = await axios.post(`http://localhost:3000/api/returns/${id}/forms/1099-div`, {
                    payer: form.payer,
                    amount: parseFloat(form.amount) || 0,
                });
                const updated = [...form1099DIVs];
                updated[index].id = res.data.id;
                setForm1099DIVs(updated);
            }
            toast.showSuccess('1099-DIV saved successfully!');
        } catch (err) {
            toast.showError('Failed to save 1099-DIV');
        } finally {
            setSaving(prev => ({ ...prev, [savingKey]: false }));
        }
    };

    const add1099B = () => {
        setForm1099Bs([...form1099Bs, { description: '', proceeds: '', costBasis: '', isLongTerm: false }]);
    };

    const delete1099B = async (index: number) => {
        const form = form1099Bs[index];
        if (form.id) {
            try {
                await axios.delete(`http://localhost:3000/api/returns/${id}/forms/1099-b/${form.id}`);
                toast.showSuccess('1099-B deleted');
            } catch (err) {
                toast.showError('Failed to delete 1099-B');
                return;
            }
        }
        setForm1099Bs(form1099Bs.filter((_, i) => i !== index));
    };

    const update1099B = (index: number, field: keyof Form1099B, value: string | boolean) => {
        const updated = [...form1099Bs];
        updated[index] = { ...updated[index], [field]: value };
        setForm1099Bs(updated);
    };

    const save1099B = async (index: number) => {
        const form = form1099Bs[index];
        const savingKey = `1099b-${index}`;
        try {
            setSaving(prev => ({ ...prev, [savingKey]: true }));
            if (form.id) {
                await axios.put(`http://localhost:3000/api/returns/${id}/forms/1099-b/${form.id}`, {
                    description: form.description,
                    proceeds: parseFloat(form.proceeds) || 0,
                    costBasis: parseFloat(form.costBasis) || 0,
                    isLongTerm: form.isLongTerm,
                });
            } else {
                const res = await axios.post(`http://localhost:3000/api/returns/${id}/forms/1099-b`, {
                    description: form.description,
                    proceeds: parseFloat(form.proceeds) || 0,
                    costBasis: parseFloat(form.costBasis) || 0,
                    isLongTerm: form.isLongTerm,
                });
                const updated = [...form1099Bs];
                updated[index].id = res.data.id;
                setForm1099Bs(updated);
            }
            toast.showSuccess('1099-B saved successfully!');
        } catch (err) {
            toast.showError('Failed to save 1099-B');
        } finally {
            setSaving(prev => ({ ...prev, [savingKey]: false }));
        }
    };

    if (loading) {
        return (
            <ThreeColumnLayout currentStep="income">
                <div className="flex justify-center items-center h-64">
                    <Spinner size="lg" label="Loading forms..." />
                </div>
            </ThreeColumnLayout>
        );
    }

    return (
        <ThreeColumnLayout currentStep="income">
            <Card padding="none">
                <div className="border-b border-neutral-gray-200">
                    <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                        {[
                            { key: 'w2', label: 'W-2 Forms' },
                            { key: '1099int', label: '1099-INT' },
                            { key: '1099div', label: '1099-DIV' },
                            { key: '1099b', label: '1099-B' },
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
                    {/* W-2 Forms */}
                    {activeTab === 'w2' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-semibold text-neutral-gray-900">W-2 Wage and Tax Statements</h2>
                                <Button onClick={addW2} variant="primary" size="md" leftIcon={Plus}>
                                    Add W-2
                                </Button>
                            </div>
                            {w2Forms.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-neutral-gray-500 mb-4">No W-2 forms added yet</p>
                                    <Button onClick={addW2} variant="secondary" size="sm" leftIcon={Plus}>
                                        Add Your First W-2
                                    </Button>
                                </div>
                            ) : (
                                w2Forms.map((form, index) => {
                                    const savingKey = `w2-${index}`;
                                    return (
                                        <Card key={index} padding="lg" className="mb-4">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <FormField
                                                    label="Employer"
                                                    fieldType="input"
                                                    type="text"
                                                    value={form.employer}
                                                    onChange={(e) => updateW2(index, 'employer', e.target.value)}
                                                    placeholder="Company Name"
                                                />
                                                <div>
                                                    <label className="block text-sm font-medium text-neutral-gray-700 mb-1">
                                                        Wages (Box 1)
                                                    </label>
                                                    <CurrencyInput
                                                        value={parseFloat(form.wages) || 0}
                                                        onChange={(value) => updateW2(index, 'wages', value.toString())}
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-neutral-gray-700 mb-1">
                                                        Federal Tax Withheld (Box 2)
                                                    </label>
                                                    <CurrencyInput
                                                        value={parseFloat(form.federalTaxWithheld) || 0}
                                                        onChange={(value) => updateW2(index, 'federalTaxWithheld', value.toString())}
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-end mt-4 space-x-2">
                                                <Button
                                                    onClick={() => deleteW2(index)}
                                                    variant="danger"
                                                    size="sm"
                                                    leftIcon={Trash2}
                                                >
                                                    Delete
                                                </Button>
                                                <Button
                                                    onClick={() => saveW2(index)}
                                                    variant="primary"
                                                    size="sm"
                                                    leftIcon={Save}
                                                    loading={saving[savingKey]}
                                                    disabled={saving[savingKey]}
                                                >
                                                    Save
                                                </Button>
                                            </div>
                                        </Card>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {/* 1099-INT Forms */}
                    {activeTab === '1099int' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-semibold text-neutral-gray-900">1099-INT Interest Income</h2>
                                <Button onClick={add1099INT} variant="primary" size="md" leftIcon={Plus}>
                                    Add 1099-INT
                                </Button>
                            </div>
                            {form1099INTs.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-neutral-gray-500 mb-4">No 1099-INT forms added yet</p>
                                    <Button onClick={add1099INT} variant="secondary" size="sm" leftIcon={Plus}>
                                        Add Your First 1099-INT
                                    </Button>
                                </div>
                            ) : (
                                form1099INTs.map((form, index) => {
                                    const savingKey = `1099int-${index}`;
                                    return (
                                        <Card key={index} padding="lg" className="mb-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    label="Payer"
                                                    fieldType="input"
                                                    type="text"
                                                    value={form.payer}
                                                    onChange={(e) => update1099INT(index, 'payer', e.target.value)}
                                                    placeholder="Bank Name"
                                                />
                                                <div>
                                                    <label className="block text-sm font-medium text-neutral-gray-700 mb-1">
                                                        Interest Income (Box 1)
                                                    </label>
                                                    <CurrencyInput
                                                        value={parseFloat(form.amount) || 0}
                                                        onChange={(value) => update1099INT(index, 'amount', value.toString())}
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-end mt-4 space-x-2">
                                                <Button
                                                    onClick={() => delete1099INT(index)}
                                                    variant="danger"
                                                    size="sm"
                                                    leftIcon={Trash2}
                                                >
                                                    Delete
                                                </Button>
                                                <Button
                                                    onClick={() => save1099INT(index)}
                                                    variant="primary"
                                                    size="sm"
                                                    leftIcon={Save}
                                                    loading={saving[savingKey]}
                                                    disabled={saving[savingKey]}
                                                >
                                                    Save
                                                </Button>
                                            </div>
                                        </Card>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {/* 1099-DIV Forms */}
                    {activeTab === '1099div' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-semibold text-neutral-gray-900">1099-DIV Dividend Income</h2>
                                <Button onClick={add1099DIV} variant="primary" size="md" leftIcon={Plus}>
                                    Add 1099-DIV
                                </Button>
                            </div>
                            {form1099DIVs.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-neutral-gray-500 mb-4">No 1099-DIV forms added yet</p>
                                    <Button onClick={add1099DIV} variant="secondary" size="sm" leftIcon={Plus}>
                                        Add Your First 1099-DIV
                                    </Button>
                                </div>
                            ) : (
                                form1099DIVs.map((form, index) => {
                                    const savingKey = `1099div-${index}`;
                                    return (
                                        <Card key={index} padding="lg" className="mb-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    label="Payer"
                                                    fieldType="input"
                                                    type="text"
                                                    value={form.payer}
                                                    onChange={(e) => update1099DIV(index, 'payer', e.target.value)}
                                                    placeholder="Brokerage Name"
                                                />
                                                <div>
                                                    <label className="block text-sm font-medium text-neutral-gray-700 mb-1">
                                                        Ordinary Dividends (Box 1a)
                                                    </label>
                                                    <CurrencyInput
                                                        value={parseFloat(form.amount) || 0}
                                                        onChange={(value) => update1099DIV(index, 'amount', value.toString())}
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-end mt-4 space-x-2">
                                                <Button
                                                    onClick={() => delete1099DIV(index)}
                                                    variant="danger"
                                                    size="sm"
                                                    leftIcon={Trash2}
                                                >
                                                    Delete
                                                </Button>
                                                <Button
                                                    onClick={() => save1099DIV(index)}
                                                    variant="primary"
                                                    size="sm"
                                                    leftIcon={Save}
                                                    loading={saving[savingKey]}
                                                    disabled={saving[savingKey]}
                                                >
                                                    Save
                                                </Button>
                                            </div>
                                        </Card>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {/* 1099-B Forms */}
                    {activeTab === '1099b' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-semibold text-neutral-gray-900">1099-B Stock Transactions</h2>
                                <Button onClick={add1099B} variant="primary" size="md" leftIcon={Plus}>
                                    Add 1099-B
                                </Button>
                            </div>
                            {form1099Bs.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-neutral-gray-500 mb-4">No 1099-B forms added yet</p>
                                    <Button onClick={add1099B} variant="secondary" size="sm" leftIcon={Plus}>
                                        Add Your First 1099-B
                                    </Button>
                                </div>
                            ) : (
                                form1099Bs.map((form, index) => {
                                    const savingKey = `1099b-${index}`;
                                    return (
                                        <Card key={index} padding="lg" className="mb-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="col-span-full">
                                                    <FormField
                                                        label="Description"
                                                        fieldType="input"
                                                        type="text"
                                                        value={form.description}
                                                        onChange={(e) => update1099B(index, 'description', e.target.value)}
                                                        placeholder="e.g., 100 shares AAPL"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-neutral-gray-700 mb-1">
                                                        Proceeds
                                                    </label>
                                                    <CurrencyInput
                                                        value={parseFloat(form.proceeds) || 0}
                                                        onChange={(value) => update1099B(index, 'proceeds', value.toString())}
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-neutral-gray-700 mb-1">
                                                        Cost Basis
                                                    </label>
                                                    <CurrencyInput
                                                        value={parseFloat(form.costBasis) || 0}
                                                        onChange={(value) => update1099B(index, 'costBasis', value.toString())}
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                <div className="col-span-full">
                                                    <Checkbox
                                                        checked={form.isLongTerm}
                                                        onChange={(e) => update1099B(index, 'isLongTerm', e.target.checked)}
                                                        label="Long-term capital gain (held more than 1 year)"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-end mt-4 space-x-2">
                                                <Button
                                                    onClick={() => delete1099B(index)}
                                                    variant="danger"
                                                    size="sm"
                                                    leftIcon={Trash2}
                                                >
                                                    Delete
                                                </Button>
                                                <Button
                                                    onClick={() => save1099B(index)}
                                                    variant="primary"
                                                    size="sm"
                                                    leftIcon={Save}
                                                    loading={saving[savingKey]}
                                                    disabled={saving[savingKey]}
                                                >
                                                    Save
                                                </Button>
                                            </div>
                                        </Card>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </Card>
        </ThreeColumnLayout>
    );
};
