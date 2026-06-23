import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Copy, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TwoFactorSetup = () => {
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const username = localStorage.getItem('username');
    if (!username) {
      navigate('/login');
      return;
    }
    setup2FA(username);
  }, [navigate]);

  const setup2FA = async (username) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/2fa/setup`, { username });
      setQrCode(response.data.qrCode);
      setSecret(response.data.secret);
    } catch (err) {
      setError('Failed to setup 2FA. Please try again.');
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const username = localStorage.getItem('username');
      await axios.post(`${process.env.REACT_APP_BASE_URL}/api/2fa/enable`, {
        username,
        code: verificationCode
      });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg">
        
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft size={16} />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-foreground tracking-tight">Setup 2FA</h2>
              <p className="text-muted-foreground text-sm">Secure your account with two-factor authentication</p>
            </div>
          </div>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-5 bg-white rounded-2xl p-8 shadow-soft">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} className="text-green-500" />
            </div>
            <h3 className="text-2xl font-black text-foreground">2FA Enabled!</h3>
            <p className="text-muted-foreground">Your account is now protected with two-factor authentication.</p>
          </motion.div>
        ) : (
          <div className="bg-white rounded-2xl p-8 shadow-soft space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
                <div className="flex-1">
                  <h4 className="font-bold text-foreground text-sm mb-1">Install Authenticator App</h4>
                  <p className="text-xs text-muted-foreground">Download Google Authenticator, Authy, or similar app on your phone.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
                <div className="flex-1">
                  <h4 className="font-bold text-foreground text-sm mb-3">Scan QR Code</h4>
                  {qrCode ? (
                    <div className="bg-white p-4 rounded-xl border-2 border-border inline-block">
                      <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                    </div>
                  ) : (
                    <div className="w-48 h-48 bg-gray-100 rounded-xl animate-pulse" />
                  )}
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-2">Or enter this code manually:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-xs font-mono text-foreground break-all">
                        {secret || 'Loading...'}
                      </code>
                      <button
                        onClick={handleCopySecret}
                        disabled={!secret}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        {copied ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} className="text-muted-foreground" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
                <div className="flex-1">
                  <h4 className="font-bold text-foreground text-sm mb-3">Verify Code</h4>
                  <form onSubmit={handleVerify} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                        required
                        className="input text-center text-lg tracking-widest font-mono"
                      />
                    </div>
                    {error && (
                      <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 font-medium">
                        {error}
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={loading || verificationCode.length !== 6}
                      className="btn-primary w-full h-11 text-sm font-bold">
                      {loading ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        'Enable 2FA'
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TwoFactorSetup;
