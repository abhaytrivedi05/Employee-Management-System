import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const VerifyOtp = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const username = location.state?.username;

  useEffect(() => {
    if (!username) { navigate('/register'); return; }
    inputs.current[0]?.focus();
  }, [username, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) { setError('Enter the full 6-digit code.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${process.env.REACT_APP_BASE_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, otp: code })
      });
      const text = await res.text();
      if (!res.ok) { setError(text || 'Invalid or expired code.'); return; }
      setSuccess(true);
      setTimeout(() => navigate('/login', { state: { verified: true } }), 2000);
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true); setError('');
    try {
      const res = await fetch(`${process.env.REACT_APP_BASE_URL}/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const text = await res.text();
      if (!res.ok) { setError(text); return; }
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } catch {
      setError('Failed to resend. Try again.');
    } finally {
      setResending(false);
    }
  };

  if (success) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-4">
        <div className="w-20 h-20 rounded-2xl bg-green-100 flex items-center justify-center mx-auto">
          <CheckCircle2 size={40} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-black text-foreground">Email Verified!</h2>
        <p className="text-muted-foreground">Redirecting you to login...</p>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">

        <div className="bg-white rounded-2xl p-8 shadow-soft">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
              <Mail size={30} className="text-white" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-foreground tracking-tight">Check your email</h2>
            <p className="text-muted-foreground text-sm mt-2">
              We sent a 6-digit code to
            </p>
            <p className="font-bold text-foreground text-sm mt-1">{username}</p>
          </div>

          {/* OTP Input */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-2 justify-center" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => inputs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  className="w-12 h-14 text-center text-xl font-black border-2 rounded-xl outline-none transition-all
                    border-border focus:border-green-500 focus:ring-2 focus:ring-green-100
                    bg-gray-50 focus:bg-white text-foreground"
                />
              ))}
            </div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 font-medium text-center">
                {error}
              </motion.div>
            )}

            <button type="submit" disabled={loading || otp.join('').length !== 6}
              className="btn-primary w-full h-11 text-sm font-bold">
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <>Verify Email <ArrowRight size={15} /></>}
            </button>
          </form>

          {/* Resend */}
          <div className="mt-6 text-center">
            {countdown > 0 ? (
              <p className="text-sm text-muted-foreground">
                Resend code in <span className="font-bold text-foreground">{countdown}s</span>
              </p>
            ) : (
              <button onClick={handleResend} disabled={resending}
                className="text-sm text-green-600 font-bold hover:text-green-700 hover:underline flex items-center gap-1.5 mx-auto transition-colors">
                <RefreshCw size={14} className={resending ? 'animate-spin' : ''} />
                {resending ? 'Sending...' : 'Resend code'}
              </button>
            )}
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Wrong email?{' '}
            <button onClick={() => navigate('/register')} className="text-green-600 font-bold hover:underline">
              Go back
            </button>
          </p>
        </div>

        {/* Dev hint */}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          No email configured? Check the backend console for your OTP code.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
            <p className="text-xs font-bold text-yellow-700">Dev Mode</p>
            <p className="text-xs text-yellow-600 mt-1">
              OTP is printed in the backend terminal window. Look for:
            </p>
            <code className="text-xs font-mono text-yellow-800 block mt-1">
              OTP for {username} : ######
            </code>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyOtp;
