import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, ShieldCheck, ShieldOff, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TwoFactorManage = () => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [disableCode, setDisableCode] = useState('');
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    check2FAStatus();
  }, []);

  const check2FAStatus = async () => {
    try {
      const username = localStorage.getItem('username');
      if (!username) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/2fa/status/${username}`);
      setIs2FAEnabled(response.data.enabled);
    } catch (err) {
      console.error('Failed to check 2FA status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = () => {
    navigate('/setup-2fa');
  };

  const handleDisable2FA = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const username = localStorage.getItem('username');
      await axios.post(`${process.env.REACT_APP_BASE_URL}/api/2fa/disable`, {
        username,
        code: disableCode
      });

      setIs2FAEnabled(false);
      setShowDisableModal(false);
      setDisableCode('');
    } catch (err) {
      setError(err.response?.data || 'Invalid verification code');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-soft">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
            is2FAEnabled 
              ? 'bg-gradient-to-br from-green-400 to-green-600' 
              : 'bg-gradient-to-br from-gray-300 to-gray-400'
          }`}>
            {is2FAEnabled ? <ShieldCheck size={24} className="text-white" /> : <Shield size={24} className="text-white" />}
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-black text-foreground mb-1">Two-Factor Authentication</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {is2FAEnabled 
                ? 'Your account is protected with 2FA' 
                : 'Add an extra layer of security to your account'}
            </p>

            {is2FAEnabled ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg w-fit">
                  <ShieldCheck size={16} />
                  <span className="font-semibold">Enabled</span>
                </div>
                <button
                  onClick={() => setShowDisableModal(true)}
                  className="text-sm text-red-600 hover:text-red-700 font-semibold hover:underline transition-colors">
                  Disable 2FA
                </button>
              </div>
            ) : (
              <button
                onClick={handleEnable2FA}
                className="btn-primary h-10 px-6 text-sm font-bold">
                Enable 2FA
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Disable 2FA Modal */}
      {showDisableModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowDisableModal(false)}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-black text-foreground">Disable 2FA</h3>
                <p className="text-sm text-muted-foreground">This will reduce your account security</p>
              </div>
            </div>

            <form onSubmit={handleDisable2FA} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground/80 uppercase tracking-wider mb-2 block">
                  Enter verification code
                </label>
                <input
                  type="text"
                  placeholder="000000"
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                  autoFocus
                  className="input text-center text-lg tracking-widest font-mono"
                />
              </div>

              {error && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 font-medium">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDisableModal(false);
                    setDisableCode('');
                    setError('');
                  }}
                  className="flex-1 h-10 px-4 rounded-xl border-2 border-border hover:bg-gray-50 font-bold text-sm transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={disableCode.length !== 6}
                  className="flex-1 h-10 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  Disable
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default TwoFactorManage;
