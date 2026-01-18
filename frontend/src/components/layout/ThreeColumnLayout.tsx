import React from 'react';
import { Layout } from './Layout';
import { NavigationSidebar } from './NavigationSidebar';
import { AssistantRail } from './AssistantRail';

interface ThreeColumnLayoutProps {
    children: React.ReactNode;
    currentStep?: string;
}

export const ThreeColumnLayout: React.FC<ThreeColumnLayoutProps> = ({ children, currentStep = 'income' }) => {
    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                    {/* Left Column: Navigation - Hidden on mobile for now (future: bottom nav or burger) */}
                    <div className="hidden lg:block lg:col-span-2">
                        <nav className="sticky top-24">
                            <NavigationSidebar currentStep={currentStep} />
                        </nav>
                    </div>

                    {/* Middle Column: Main Content */}
                    <main className="lg:col-span-7">
                        {children}
                    </main>

                    {/* Right Column: Assistant Rail */}
                    <div className="hidden lg:block lg:col-span-3">
                        <div className="sticky top-24">
                            <AssistantRail />
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
