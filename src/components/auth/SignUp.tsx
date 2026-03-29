import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Zap, Mail, KeyRound, Loader2, ShieldCheck, Phone } from 'lucide-react';
import { claimDevice } from '../../lib/deviceService';

interface SignUpProps {
  onShowLogin: () => void;
}

export const SignUp: React.FC<SignUpProps> = ({ onShowLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [activationCode, setActivationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (!activationCode.trim()) {
      setError("Hardware activation code is required.");
      return;
    }

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!email.includes('@')) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // 1. Sign up the user first
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({ email: email, password: password });

      if (signUpError) throw signUpError;
      if (!user) throw new Error('Sign up failed. Please try again.');

      // 2. Claim the device using the shared logic
      const result = await claimDevice(activationCode);

      if (!result.success) {
        // If claiming fails, we inform the user but the account is created.
        setError(`Your account was created, but the machine could not be linked. ${result.error} Please try again from the dashboard or contact support.`);
        // We don't return here because the account is created, but we don't call onShowLogin() yet
        // so the user can see the message.
        return;
      }

      alert('Account created and device linked successfully! Please check your email to verify your account.');
      onShowLogin();

    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred during signup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-10 rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 animate-in">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Create Owner Account</h1>
        <p className="text-sm text-slate-500 mt-1">Register your hardware to begin</p>
      </div>

      <form onSubmit={handleSignUp} className="space-y-5">
        <div className="relative">
          <ShieldCheck className="absolute top-1/2 left-5 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            value={activationCode}
            onChange={(e) => setActivationCode(e.target.value)}
            className="w-full p-4 pl-14 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-slate-700"
            placeholder="Hardware Activation Code"
          />
        </div>
        <div className="relative">
          <Mail className="absolute top-1/2 left-5 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 pl-14 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-slate-700"
            placeholder="you@example.com"
          />
        </div>
        <div className="relative">
          <KeyRound className="absolute top-1/2 left-5 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 pl-14 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-slate-700"
            placeholder="Create Password"
          />
        </div>
        <div className="relative">
          <KeyRound className="absolute top-1/2 left-5 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-4 pl-14 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-slate-700"
            placeholder="Confirm Password"
          />
        </div>
        <button 
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center gap-3 p-4 bg-blue-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition-colors disabled:bg-blue-300 shadow-lg shadow-blue-600/20"
        >
          {loading ? <Loader2 className="animate-spin" /> : 'Register & Create Account'}
        </button>
      </form>

      {error && <p className="mt-6 text-center text-sm text-red-500 bg-red-50 p-3 rounded-lg">{error}</p>}

      <p className="mt-8 text-center text-sm text-slate-500">
        Already have a fleet account?{' '}
        <button onClick={onShowLogin} className="font-bold text-blue-600 hover:underline">Login</button>
      </p>
    </div>
  );
};