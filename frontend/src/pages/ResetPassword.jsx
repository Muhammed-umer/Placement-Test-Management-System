import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, KeyRound, CheckCircle2 } from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8081/api/v1/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword })
      });

      if (res.ok) {
        setSuccess(true);
        // Clear the mustChangePassword flag locally
        localStorage.setItem('mustChangePassword', 'false');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        const errorData = await res.text();
        setError(errorData || 'Failed to reset password');
      }
    } catch (err) {
      setError('Network error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0f1a] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[60vh] bg-rose-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel max-w-md w-full p-8 md:p-10 rounded-[2rem] border border-rose-500/20 shadow-2xl relative z-10"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center ring-4 ring-rose-500/20">
            <ShieldAlert className="w-8 h-8 text-rose-500" />
          </div>
        </div>

        <h2 className="text-3xl font-extrabold text-white text-center mb-2">Security Update</h2>
        <p className="text-slate-400 text-center text-sm mb-8 font-medium">
          For your safety, please set a new password before accessing your dashboard.
        </p>

        {success ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center text-emerald-400 py-8">
             <CheckCircle2 className="w-16 h-16 mb-4" />
             <h3 className="text-xl font-bold text-white mb-1">Password Secured</h3>
             <p className="text-sm">Redirecting to Dashboard...</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">New Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="premium-input w-full pl-12 pr-4 py-4 rounded-xl font-bold bg-slate-900/80 border border-slate-700 focus:border-rose-500 transition-colors"
                  placeholder="At least 8 characters"
                  required
                />
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="premium-input w-full pl-12 pr-4 py-4 rounded-xl font-bold bg-slate-900/80 border border-slate-700 focus:border-rose-500 transition-colors"
                  placeholder="Repeat new password"
                  required
                />
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              </div>
            </div>

            {error && <p className="text-rose-400 text-sm font-bold text-center bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-lg hover:shadow-rose-500/25 active:scale-95 flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Secure Account'
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
