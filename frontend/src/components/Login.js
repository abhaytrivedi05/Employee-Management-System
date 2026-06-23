import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Users, CheckCircle2 } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.from;
  const { signIn } = useAuth();

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const result = await signIn(email, password);
      if (!result.user.emailVerified) {
        navigate('/verify-email');
        return;
      }
      navigate(redirectPath || '/dashboard');
    } catch (err) {
      const msg = {
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/too-many-requests': 'Too many attempts. Try again later.',
        'auth/user-disabled': 'This account has been disabled.',
      }[err.code] || 'Sign in failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left branding */}
      <motion.div
        initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0d2318 0%, #1a4731 50%, #28a06e 100%)' }}>
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.2, 0.15] }} transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 right-0 w-96 h-96 rounded-full bg-green-400/15 blur-3xl" />
        <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.15, 0.1] }} transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute bottom-1/4 left-0 w-80 h-80 rounded-full bg-green-500/10 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
            <Users size={18} className="text-white" />
          </div>
          <span className="text-white font-black text-xl tracking-tight">TeamHub</span>
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl font-black text-white leading-tight mb-5">
            Navigate smart,<br /><span className="text-green-300">Work Faster.</span>
          </h1>
          <p className="text-white/50 text-base leading-relaxed mb-10 max-w-md">
            One platform to manage your entire workforce — from headcount to departments.
          </p>
          <div className="space-y-4">
            {['UX-first design', 'Fully responsive', 'Real-time data sync', 'Export-ready reports'].map((item, i) => (
              <motion.div key={item} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 + 0.5 }} className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-green-300 flex-shrink-0" />
                <span className="text-white/70 text-sm font-medium">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-white/25 text-xs">© {new Date().getFullYear()} TeamHub HR Management</p>
      </motion.div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }} className="w-full max-w-md">

          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-md">
              <Users size={16} className="text-white" />
            </div>
            <span className="font-black text-xl text-foreground tracking-tight">TeamHub</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-foreground tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground text-base mt-2">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground/80 uppercase tracking-wider">Email address</label>
              <input type="email" placeholder="you@example.com" value={email}
                onChange={e => setEmail(e.target.value)} required className="input" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground/80 uppercase tracking-wider">Password</label>
                <Link to="/reset-password" className="text-xs text-green-600 hover:text-green-700 hover:underline font-semibold transition-colors">Forgot?</Link>
              </div>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password}
                  onChange={e => setPassword(e.target.value)} required className="input pr-11" />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 font-medium">
                {error}
              </motion.div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full h-11 text-sm font-bold mt-2">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Sign in <ArrowRight size={15} /></>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-green-600 font-bold hover:text-green-700 hover:underline transition-colors">Create one free</Link>
          </p>

          <div className="mt-8 pt-6 border-t border-border flex justify-center gap-8">
            {['SSL Secured', 'GDPR Ready', 'SOC 2'].map(l => (
              <div key={l} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CheckCircle2 size={12} className="text-green-500" /> <span className="font-medium">{l}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
