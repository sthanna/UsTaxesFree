import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Card padding size */
    padding?: 'none' | 'sm' | 'md' | 'lg';
    /** Whether card has hover effect */
    hoverable?: boolean;
    /** Children content */
    children: React.ReactNode;
}

const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
};

export const Card: React.FC<CardProps> = ({
    padding = 'md',
    hoverable = false,
    children,
    className = '',
    ...props
}) => {
    const hoverClass = hoverable ? 'hover:shadow-lg transition-shadow duration-200' : '';

    return (
        <div
            className={`
                bg-white rounded-lg border border-neutral-gray-200 shadow-sm
                ${paddingStyles[padding]}
                ${hoverClass}
                ${className}
            `.trim()}
            {...props}
        >
            {children}
        </div>
    );
};

Card.displayName = 'Card';


// CardHeader component
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Title */
    title?: string;
    /** Description */
    description?: string;
    /** Action elements (e.g., button) */
    action?: React.ReactNode;
    /** Children content */
    children?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
    title,
    description,
    action,
    children,
    className = '',
    ...props
}) => {
    return (
        <div
            className={`border-b border-neutral-gray-200 pb-4 mb-4 ${className}`.trim()}
            {...props}
        >
            {children || (
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        {title && (
                            <h3 className="text-lg font-semibold text-neutral-gray-900">
                                {title}
                            </h3>
                        )}
                        {description && (
                            <p className="text-sm text-neutral-gray-600 mt-1">
                                {description}
                            </p>
                        )}
                    </div>
                    {action && <div className="ml-4">{action}</div>}
                </div>
            )}
        </div>
    );
};

CardHeader.displayName = 'CardHeader';


// CardFooter component
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Children content */
    children: React.ReactNode;
}

export const CardFooter: React.FC<CardFooterProps> = ({
    children,
    className = '',
    ...props
}) => {
    return (
        <div
            className={`border-t border-neutral-gray-200 pt-4 mt-4 ${className}`.trim()}
            {...props}
        >
            {children}
        </div>
    );
};

CardFooter.displayName = 'CardFooter';
