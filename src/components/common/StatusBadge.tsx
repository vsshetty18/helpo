import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'vehicle' | 'incident' | 'notification' | 'connection' | 'severity';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'vehicle', className = '' }) => {
  const norm = status.toLowerCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';
  let label = status;

  if (type === 'vehicle') {
    switch (norm) {
      case 'moving':
        styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        dotColor = 'bg-emerald-500 animate-pulse';
        label = 'Moving';
        break;
      case 'stationary':
        styles = 'bg-blue-50 text-blue-700 border-blue-200';
        dotColor = 'bg-blue-500';
        label = 'Stationary';
        break;
      case 'incident':
        styles = 'bg-rose-50 text-rose-700 border-rose-200';
        dotColor = 'bg-rose-500 animate-ping';
        label = 'Incident Alert';
        break;
      case 'offline':
        styles = 'bg-slate-100 text-slate-600 border-slate-200';
        dotColor = 'bg-slate-400';
        label = 'Offline';
        break;
    }
  } else if (type === 'severity') {
    switch (norm) {
      case 'critical':
        styles = 'bg-rose-100 text-rose-800 border-rose-300 font-semibold';
        dotColor = 'bg-rose-600';
        label = 'Critical Impact';
        break;
      case 'high':
        styles = 'bg-orange-100 text-orange-800 border-orange-300 font-semibold';
        dotColor = 'bg-orange-600';
        label = 'High Severity';
        break;
      case 'moderate':
        styles = 'bg-amber-100 text-amber-800 border-amber-300';
        dotColor = 'bg-amber-500';
        label = 'Moderate';
        break;
      case 'low':
        styles = 'bg-emerald-50 text-emerald-800 border-emerald-200';
        dotColor = 'bg-emerald-500';
        label = 'Low / Minor';
        break;
    }
  } else if (type === 'incident') {
    switch (norm) {
      case 'awaiting_review':
        styles = 'bg-amber-50 text-amber-800 border-amber-200';
        dotColor = 'bg-amber-500';
        label = 'Awaiting Review';
        break;
      case 'confirmed':
        styles = 'bg-rose-50 text-rose-800 border-rose-200';
        dotColor = 'bg-rose-500';
        label = 'Confirmed Incident';
        break;
      case 'dismissed':
        styles = 'bg-slate-100 text-slate-600 border-slate-200';
        dotColor = 'bg-slate-400';
        label = 'Dismissed';
        break;
    }
  } else if (type === 'notification') {
    switch (norm) {
      case 'delivered':
        styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        dotColor = 'bg-emerald-500';
        label = 'Delivered';
        break;
      case 'acknowledged':
        styles = 'bg-blue-50 text-blue-700 border-blue-200 font-medium';
        dotColor = 'bg-blue-500';
        label = 'Acknowledged';
        break;
      case 'sent':
        styles = 'bg-sky-50 text-sky-700 border-sky-200';
        dotColor = 'bg-sky-500 animate-pulse';
        label = 'Sent';
        break;
      case 'queued':
      case 'pending':
        styles = 'bg-amber-50 text-amber-700 border-amber-200';
        dotColor = 'bg-amber-500';
        label = norm === 'queued' ? 'Queued' : 'Pending';
        break;
      case 'failed':
        styles = 'bg-rose-50 text-rose-700 border-rose-200';
        dotColor = 'bg-rose-500';
        label = 'Failed';
        break;
    }
  } else if (type === 'connection') {
    switch (norm) {
      case 'online':
        styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        dotColor = 'bg-emerald-500';
        label = 'Online';
        break;
      case 'degraded':
        styles = 'bg-amber-50 text-amber-700 border-amber-200';
        dotColor = 'bg-amber-500';
        label = 'Degraded';
        break;
      case 'offline':
        styles = 'bg-rose-50 text-rose-600 border-rose-200';
        dotColor = 'bg-rose-400';
        label = 'Offline';
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
      <span>{label}</span>
    </span>
  );
};
