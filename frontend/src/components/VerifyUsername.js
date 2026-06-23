import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Users, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const VerifyUsername = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true); setError(''); setSuccess(false);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) setError(error.message || 'Something went wrong.');
    else setSuccess(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-green-500 flex items-center justify-center">
            <Users size={15} className="text-white" />
          </div>
          <span className="font-black text-lg text-foreground">TeamHub</span>
        </div>
        <div className="card p-7">
          <h1 className="text-xl font-black text-foreground mb-1">Forgot password</h1>
          <p className="text-sm text-muted-foreground mb-6">Enter your email and we'll send you a reset link.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Email address</label>
              <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="input" />
            </div>
            {error && <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
            {success && (
              <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <CheckCircle2 size={13} /> Reset link sent! Check your inbox.
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full h-10">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Send reset link <ArrowRight size={14} /></>}
            </button>
          </form>
          <div className="mt-5 text-center">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-green-600 hover:underline font-medium">
              <ArrowLeft size={13} /> Back to login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyUsername;
