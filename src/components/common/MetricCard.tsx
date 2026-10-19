import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  variant?: 'default' | 'danger' | 'warning' | 'success' | 'accent';
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  onClick
}) => {
  let borderClass = 'border-slate-200';
  let iconBgClass = 'bg-slate-100 text-[#14243A]';

  if (variant === 'danger') {
    borderClass = 'border-rose-200 hover:border-rose-300';
    iconBgClass = 'bg-rose-50 text-rose-600';
  } else if (variant === 'warning') {
    borderClass = 'border-amber-200 hover:border-amber-300';
    iconBgClass = 'bg-amber-50 text-amber-600';
  } else if (variant === 'success') {
    borderClass = 'border-emerald-200 hover:border-emerald-300';
    iconBgClass = 'bg-emerald-50 text-emerald-600';
  } else if (variant === 'accent') {
    borderClass = 'border-blue-200 hover:border-blue-300';
    iconBgClass = 'bg-blue-50 text-[#3478F6]';
  }

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-5 border ${borderClass} shadow-xs transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#697586]">{title}</span>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconBgClass}`}>
          {icon}
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-[#172033] tracking-tight">{value}</span>
        {trend && (
          <span
            className={`text-xs font-medium px-1.5 py-0.5 rounded ${
              trend.isNeutral
                ? 'bg-slate-100 text-slate-600'
                : trend.isPositive
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-rose-50 text-rose-700'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-[#697586] mt-1.5">{subtitle}</p>}
    </div>
  );
};
