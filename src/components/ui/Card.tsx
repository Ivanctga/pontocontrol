import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-card shadow-card hover:shadow-card-hover transition-shadow p-6 ${className}`}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  description?: string;
}

export function CardTitle({ children, className = '', icon, description }: CardTitleProps) {
  return (
    <div className="flex items-center space-x-3">
      {icon && (
        <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-full">
          <div className="text-primary-600">{icon}</div>
        </div>
      )}
      <div>
        <h3 className={`text-xl font-bold text-gray-900 ${className}`}>{children}</h3>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-100 ${className}`}>
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: string;
    positive?: boolean;
  };
  iconBgColor?: string;
  iconColor?: string;
}

export function StatCard({ title, value, icon, trend, iconBgColor = 'bg-primary-100', iconColor = 'text-primary-600' }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`flex items-center justify-center w-12 h-12 ${iconBgColor} rounded-full`}>
          <div className={`w-6 h-6 ${iconColor}`}>{icon}</div>
        </div>
      </div>
      {trend && (
        <div className="mt-4">
          <div className="flex items-center text-sm">
            <span className={`font-medium ${trend.positive ? 'text-success-600' : 'text-warning-600'}`}>
              {trend.value}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}