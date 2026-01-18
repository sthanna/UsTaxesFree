import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save, Trash2, Plus, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/atoms/Button';
import { Card } from '../components/molecules/Card';
import { FormField } from '../components/molecules/FormField';
import { SSNInput } from '../components/molecules/SSNInput';
import { DateInput } from '../components/molecules/DateInput';
import { Spinner } from '../components/atoms/Spinner';
import { useToast } from '../context/ToastContext';
import { ConfirmDialog } from '../components/molecules/Modal';

interface Dependent {
    id?: number;
    return_id: number;
    first_name: string;
    last_name: string;
    ssn: string;
    date_of_birth: string;
    relationship: string;
    months_lived_with: number;
}

export const Dependents: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { token } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<{ [key: number]: boolean }>({});
    const [dependents, setDependents] = useState<Dependent[]>([]);
    const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

    useEffect(() => {
        fetchDependents();
    }, [id]);

    const fetchDependents = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/api/returns/${id}/dependents`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDependents(response.data);
        } catch (err) {
            toast.showError('Failed to load dependents');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        const newDep: Dependent = {
            return_id: parseInt(id!),
            first_name: '',
            last_name: '',
            ssn: '',
            date_of_birth: '',
            relationship: 'Child',
            months_lived_with: 12
        };
        setDependents([...dependents, newDep]);
    };

    const handleChange = (index: number, field: keyof Dependent, value: string | number) => {
        const updated = [...dependents];
        updated[index] = { ...updated[index], [field]: value };
        setDependents(updated);
    };

    const handleSave = async (index: number) => {
        try {
            const dep = dependents[index];
            if (!dep.first_name || !dep.ssn) {
                toast.showError('First name and SSN are required');
                return;
            }

            setSaving(prev => ({ ...prev, [index]: true }));

            if (dep.id) {
                await axios.put(`http://localhost:3000/api/returns/${id}/dependents/${dep.id}`, dep, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                const res = await axios.post(`http://localhost:3000/api/returns/${id}/dependents`, dep, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const updated = [...dependents];
                updated[index] = res.data;
                setDependents(updated);
            }
            toast.showSuccess('Dependent saved successfully!');
        } catch (err: any) {
            toast.showError(err.response?.data?.error || 'Failed to save dependent');
        } finally {
            setSaving(prev => ({ ...prev, [index]: false }));
        }
    };

    const handleDelete = async (index: number) => {
        try {
            const dep = dependents[index];
            if (dep.id) {
                await axios.delete(`http://localhost:3000/api/returns/${id}/dependents/${dep.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            const updated = dependents.filter((_, i) => i !== index);
            setDependents(updated);
            toast.showSuccess('Dependent deleted successfully');
        } catch (err) {
            toast.showError('Failed to delete dependent');
        } finally {
            setDeleteIndex(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-gray flex items-center justify-center">
                <Spinner size="lg" label="Loading dependents..." />
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
                            <h1 className="text-2xl font-bold text-neutral-gray-900">Manage Dependents</h1>
                            <p className="text-sm text-neutral-gray-600 mt-1">Add family members to check for tax credits</p>
                        </div>
                    </div>
                    <Button
                        onClick={handleAdd}
                        variant="primary"
                        size="md"
                        leftIcon={Plus}
                    >
                        Add Dependent
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-6">
                    {dependents.length === 0 ? (
                        <Card padding="lg" className="text-center">
                            <div className="py-12">
                                <div className="bg-trust-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <User className="h-8 w-8 text-trust-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-neutral-gray-900 mb-2">No dependents yet</h3>
                                <p className="text-neutral-gray-600 mb-6">Add family members to check for tax credits like the Child Tax Credit</p>
                                <Button
                                    onClick={handleAdd}
                                    variant="primary"
                                    size="md"
                                    leftIcon={Plus}
                                >
                                    Add Your First Dependent
                                </Button>
                            </div>
                        </Card>
                    ) : (
                        dependents.map((dep, index) => (
                            <Card key={dep.id || `new-${index}`} padding="lg">
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
                                    <div className="sm:col-span-2">
                                        <FormField
                                            label="First Name"
                                            fieldType="input"
                                            type="text"
                                            value={dep.first_name}
                                            onChange={(e) => handleChange(index, 'first_name', e.target.value)}
                                            placeholder="First name"
                                            required
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <FormField
                                            label="Last Name"
                                            fieldType="input"
                                            type="text"
                                            value={dep.last_name}
                                            onChange={(e) => handleChange(index, 'last_name', e.target.value)}
                                            placeholder="Last name"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-neutral-gray-700 mb-1">
                                            SSN <span className="text-alert-red-500">*</span>
                                        </label>
                                        <SSNInput
                                            value={dep.ssn}
                                            onChange={(value) => handleChange(index, 'ssn', value)}
                                            placeholder="XXX-XX-XXXX"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <FormField
                                            label="Relationship"
                                            fieldType="select"
                                            value={dep.relationship}
                                            onChange={(e) => handleChange(index, 'relationship', e.target.value)}
                                        >
                                            <option>Child</option>
                                            <option>Stepchild</option>
                                            <option>Foster Child</option>
                                            <option>Grandchild</option>
                                            <option>Sibling</option>
                                            <option>Parent</option>
                                            <option>Grandparent</option>
                                            <option>Other Relative</option>
                                        </FormField>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-neutral-gray-700 mb-1">
                                            Date of Birth
                                        </label>
                                        <DateInput
                                            value={typeof dep.date_of_birth === 'string' ? dep.date_of_birth.split('T')[0] : ''}
                                            onChange={(e) => handleChange(index, 'date_of_birth', e.target.value)}
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <FormField
                                            label="Months Lived With You"
                                            fieldType="input"
                                            type="number"
                                            min="0"
                                            max="12"
                                            value={dep.months_lived_with.toString()}
                                            onChange={(e) => handleChange(index, 'months_lived_with', parseInt(e.target.value) || 0)}
                                            helpText="Enter a number between 0 and 12"
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end space-x-3">
                                    <Button
                                        onClick={() => setDeleteIndex(index)}
                                        variant="danger"
                                        size="sm"
                                        leftIcon={Trash2}
                                    >
                                        Remove
                                    </Button>
                                    <Button
                                        onClick={() => handleSave(index)}
                                        variant="primary"
                                        size="sm"
                                        leftIcon={Save}
                                        loading={saving[index]}
                                        disabled={saving[index]}
                                    >
                                        Save Dependent
                                    </Button>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </main>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteIndex !== null}
                onClose={() => setDeleteIndex(null)}
                onConfirm={() => deleteIndex !== null && handleDelete(deleteIndex)}
                title="Delete Dependent"
                message="Are you sure you want to delete this dependent? This action cannot be undone."
                confirmText="Delete"
                confirmVariant="danger"
            />
        </div>
    );
};
