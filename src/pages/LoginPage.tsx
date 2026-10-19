import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, Info, CheckCircle2 } from 'lucide-react';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState(DEMO_CREDENTIALS.email);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.password);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      const res = login(email, password);
      setIsLoading(false);

      if (res.success) {
        success('Demo Session Started', 'Logged in as Fleet Safety Operations Commander.');
        navigate('/dashboard');
      } else {
        setErrorMsg(res.error || 'Failed to authenticate');
      }
    }, 400);
  };

  const handleUseDemo = () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-[#14243A] flex items-center justify-center text-white shadow-xl shadow-slate-900/10">
            <ShieldCheck className="w-8 h-8 text-[#3478F6] stroke-[2.2]" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-extrabold text-[#14243A] tracking-tight">
          VehicleGuard AI
        </h2>
        <p className="mt-1 text-center text-xs uppercase tracking-wider text-[#697586] font-semibold">
          AI Fleet Tracking, Crash Detection & Emergency Coordination
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200 sm:px-10">
          {/* Demo disclaimer banner */}
          <div className="mb-6 p-3.5 bg-blue-50/70 rounded-xl border border-blue-100 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#3478F6] shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 leading-relaxed">
              <span className="font-semibold block mb-0.5">Academic Project Demonstration</span>
              Frontend demo mode with realistic simulated sensor streams. Pre-filled with demo operator credentials.
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
              {errorMsg}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                Operator Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#3478F6] focus:border-transparent text-slate-900"
                  placeholder="admin@vehicleguard.ai"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#172033]">
                  Security Password
                </label>
                <button
                  type="button"
                  onClick={handleUseDemo}
                  className="text-[11px] text-[#3478F6] hover:underline font-medium"
                >
                  Fill Demo Password
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#3478F6] focus:border-transparent text-slate-900"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-[#14243A] hover:bg-[#1a314f] focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-[#3478F6] transition-colors cursor-pointer"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Enter Operations Center</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick credentials reference */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="text-[11px] text-[#697586] font-medium flex items-center justify-between">
              <span>Demo Login:</span>
              <code className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-mono">
                admin@vehicleguard.ai / demo
              </code>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-8 grid grid-cols-3 gap-3 text-center text-[11px] text-slate-500 font-medium">
          <div className="flex flex-col items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Real-time GPS Tracking</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>AI Accident Classifier</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Emergency 112 Dispatch</span>
          </div>
        </div>
      </div>
    </div>
  );
};
