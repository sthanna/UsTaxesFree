import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { useNavigate } from 'react-router-dom';
import { Home, Briefcase, Users, TrendingUp } from 'lucide-react';
import { Button } from '../components/atoms/Button';
import { ProgressBar } from '../components/atoms/ProgressBar';
import { Card } from '../components/molecules/Card';

interface Question {
    id: string;
    text: string;
    subtext: string;
    icon: React.ComponentType<{ className?: string }>;
    options: {
        label: string;
        value: boolean;
    }[];
}

export const Onboarding: React.FC = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, boolean>>({});

    const questions: Question[] = [
        {
            id: 'homeowner',
            text: 'Did you own a home in 2025?',
            subtext: 'This helps us find mortgage interest deductions.',
            icon: Home,
            options: [{ label: 'Yes', value: true }, { label: 'No', value: false }]
        },
        {
            id: 'freelance',
            text: 'Did you have any freelance or self-employed income?',
            subtext: 'We will unlock Schedule C for you.',
            icon: Briefcase,
            options: [{ label: 'Yes', value: true }, { label: 'No', value: false }]
        },
        {
            id: 'dependents',
            text: 'Do you have any children or other dependents?',
            subtext: 'This enables Child Tax Credit calculations.',
            icon: Users,
            options: [{ label: 'Yes', value: true }, { label: 'No', value: false }]
        },
        {
            id: 'investments',
            text: 'Did you sell any stocks, bonds, or crypto?',
            subtext: 'We will prepare Schedule D for you.',
            icon: TrendingUp,
            options: [{ label: 'Yes', value: true }, { label: 'No', value: false }]
        }
    ];

    const handleAnswer = (value: boolean) => {
        setAnswers(prev => ({ ...prev, [questions[currentStep].id]: value }));

        if (currentStep < questions.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            // Finished
            console.log('Onboarding complete. Answers:', answers);
            // In a real app, save to backend here
            navigate('/dashboard');
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const currentQuestion = questions[currentStep];
    const IconComponent = currentQuestion.icon;
    const progressPercentage = ((currentStep) / questions.length) * 100;

    return (
        <Layout>
            <div className="max-w-2xl mx-auto px-4 py-12">
                {/* Progress Section */}
                <div className="mb-12">
                    <ProgressBar
                        value={progressPercentage}
                        variant="primary"
                        size="md"
                    />
                    <div className="flex justify-between items-center mt-2">
                        <p className="text-sm text-neutral-gray-600">
                            Step {currentStep + 1} of {questions.length}
                        </p>
                        <p className="text-sm font-medium text-trust-blue-600">
                            {Math.round(progressPercentage)}% Complete
                        </p>
                    </div>
                </div>

                {/* Question Card */}
                <Card padding="lg" className="text-center">
                    {/* Icon */}
                    <div className="bg-trust-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <IconComponent className="w-10 h-10 text-trust-blue-600" />
                    </div>

                    {/* Question Text */}
                    <h1 className="text-3xl font-bold text-neutral-gray-900 mb-4">
                        {currentQuestion.text}
                    </h1>

                    <p className="text-lg text-neutral-gray-600 mb-10">
                        {currentQuestion.subtext}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto mb-6">
                        <Button
                            onClick={() => handleAnswer(true)}
                            variant="primary"
                            size="xl"
                            fullWidth
                            className="shadow-lg transform transition-transform hover:scale-105"
                        >
                            Yes
                        </Button>
                        <Button
                            onClick={() => handleAnswer(false)}
                            variant="secondary"
                            size="xl"
                            fullWidth
                            className="transform transition-transform hover:scale-105"
                        >
                            No
                        </Button>
                    </div>

                    {/* Back Button */}
                    {currentStep > 0 && (
                        <Button
                            onClick={handleBack}
                            variant="ghost"
                            size="sm"
                        >
                            Go Back
                        </Button>
                    )}
                </Card>

                {/* Help Text */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-neutral-gray-500">
                        Don't worry, you can always change these answers later
                    </p>
                </div>
            </div>
        </Layout>
    );
};
