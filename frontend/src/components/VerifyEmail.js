import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, RefreshCw, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const VerifyEmail = () => {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [checking, setChecking] = useState(false);
  const { user, resendVerification, signOut } = useAuth();
  const navigate = useNavigate();

  const handleResend = async () => {
    setResending(true);
    try {
      await resendVerification();
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setResending(false);
    }
  };

  const handleCheckVerified = async () => {
    setChecking(true);
    try {
      await user.reload();
      if (user.emailVerified) {
        navigate('/dashboard');
      } else {
        alert('Email not verified yet. Please check your inbox and click the link.');
      }
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white rounded-2xl p-8 shadow-soft text-center">

          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Mail size={36} className="text-white" />
          </div>

          <h2 className="text-2xl font-black text-foreground tracking-tight mb-2">Check your email</h2>
          <p className="text-muted-foreground text-sm mb-1">We sent a verification link to</p>
          <p className="font-bold text-foreground text-sm mb-6">{user?.email}</p>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-green-800 font-medium mb-1">What to do:</p>
            <ol className="text-xs text-green-700 space-y-1 list-decimal list-inside">
              <li>Open your email inbox</li>
              <li>Find the email from TeamHub</li>
              <li>Click the verification link</li>
              <li>Come back and click "I've verified"</li>
            </ol>
          </div>

          <div className="space-y-3">
            <button onClick={handleCheckVerified} disabled={checking}
              className="btn-primary w-full h-11 text-sm font-bold">
              {checking
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><CheckCircle2 size={15} /> I've verified my email</>}
            </button>

            <button onClick={handleResend} disabled={resending || resent}
              className="w-full h-10 rounded-xl border-2 border-border hover:bg-gray-50 text-sm font-semibold text-foreground transition-colors flex items-center justify-center gap-2">
              <RefreshCw size={14} className={resending ? 'animate-spin' : ''} />
              {resent ? 'Email sent!' : resending ? 'Sending...' : 'Resend verification email'}
            </button>

            <button onClick={signOut}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-2">
              Sign out and use a different account
            </button>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Check your spam folder if you don't see the email.
        </p>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
