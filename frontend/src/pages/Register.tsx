import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Ticket, Eye, EyeOff, Lock, User as UserIcon, Mail, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, isRegistering } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { label: 'None', score: 0, color: 'bg-border' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) return { label: 'Weak', score: 33, color: 'bg-rose-500' };
    if (score <= 4) return { label: 'Fair', score: 66, color: 'bg-amber-500' };
    return { label: 'Strong', score: 100, color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (!termsAgreed) {
      toast.error('Please agree to Terms and Conditions.');
      return;
    }

    try {
      await register({
        username,
        email,
        password,
        phone_number: phoneNumber,
      });
      navigate('/events');
    } catch (err) {
      // Toast error handled in hook
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl rounded-3xl glass-card border border-border shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* Left Branding Panel */}
        <div className="relative p-8 md:p-12 bg-gradient-to-tr from-purple-950 via-indigo-950 to-slate-950 text-white flex flex-col justify-between hidden md:flex overflow-hidden">
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading font-black text-2xl tracking-tight">
                Ticket<span className="text-purple-400">Pulse</span>
              </span>
            </Link>
            <h2 className="font-heading font-black text-3xl leading-tight">
              Create Your TicketPulse Account Today.
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Join thousands of concert fans, sports supporters, and summit attendees across Nepal and South Asia.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-2 relative z-10 text-xs">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <ShieldCheck className="w-4 h-4 text-amber-300" /> Guaranteed Ticket Authenticity
            </div>
            <p className="text-[11px] text-slate-300">
              Instant encrypted PDF delivery with QR verification code sent to your email.
            </p>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="p-8 md:p-12 space-y-5 flex flex-col justify-center">
          <div className="space-y-1 text-center md:text-left">
            <h2 className="font-heading font-extrabold text-2xl text-foreground">Create Account</h2>
            <p className="text-xs text-muted-foreground">Sign up to reserve seats in real time.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* Username */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-foreground">Username</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. abinash"
                  className="w-full bg-surface border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-foreground">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-surface border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-foreground">Phone Number (Optional)</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+977 9800000000"
                  className="w-full bg-surface border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-foreground">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-surface border border-border rounded-xl pl-9 pr-9 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength bar */}
              {password && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">Strength:</span>
                    <span className="font-bold text-foreground">{strength.label}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-surface border border-border overflow-hidden">
                    <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${strength.score}%` }} />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-foreground">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full bg-surface border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Terms checkbox */}
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer pt-1">
              <input
                type="checkbox"
                required
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="rounded border-border text-indigo-600 focus:ring-indigo-500"
              />
              <span>I agree to TicketPulse Terms of Service & Privacy Policy</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={isRegistering}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white font-semibold text-xs shadow-lg shadow-purple-500/30 transition-all flex items-center justify-center gap-2"
            >
              {isRegistering ? 'Registering...' : 'Complete Registration'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-xs text-center text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-500 font-bold hover:underline">
              Sign In
            </Link>
          </p>

        </div>

      </div>
    </div>
  );
};
