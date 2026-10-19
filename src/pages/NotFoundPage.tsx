import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 mb-4">
        <ShieldAlert className="w-8 h-8 text-[#3478F6]" />
      </div>
      <h1 className="text-3xl font-extrabold text-[#14243A] tracking-tight">404 — Page Not Found</h1>
      <p className="text-sm text-[#697586] max-w-md mt-2 leading-relaxed">
        The route or telemetry view you requested does not exist or has been relocated within the operations center.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[#3478F6] text-white rounded-lg hover:bg-blue-600 transition-colors shadow-xs"
        >
          <Home className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
        <Link
          to="/vehicles"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Vehicle Management</span>
        </Link>
      </div>
    </div>
  );
};
