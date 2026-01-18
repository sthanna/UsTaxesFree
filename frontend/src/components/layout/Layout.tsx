import React from 'react';
import { TrustHeader } from './TrustHeader';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-neutral-gray pt-16">
            <TrustHeader />
            <main>
                {children}
            </main>
        </div>
    );
};
