import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, GraduationCap, ShieldAlert, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    // Auto-append @gcee.ac.in if user didn't type it
    let finalEmail = email.trim();
    if (!finalEmail.includes('@')) {
      finalEmail = finalEmail + '@gcee.ac.in';
    }

    if (!finalEmail.endsWith('@gcee.ac.in')) {
      setError('Access restricted to @gcee.ac.in accounts only');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8081/api/v1/auth/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: finalEmail, password })
      });
      
      const data = await response.json().catch(() => ({ message: 'Invalid Credentials' }));
      
      if (!response.ok) {
        if (response.status === 403) throw new Error('Incorrect credentials or account disabled.');
        throw new Error(data.message || 'Invalid Credentials');
      }
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('mustChangePassword', data.mustChangePassword);
      localStorage.setItem('role', data.role);
      
      if (data.role === 'ROLE_ADMIN' || data.role === 'ROLE_SUPER_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-brand-100">
      <div className="w-full max-w-md glass-panel p-8 rounded-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-brand-50 mb-4 border border-brand-300">
            <GraduationCap className="h-10 w-10 text-brand-700" />
          </div>
          <h1 className="text-3xl font-extrabold text-brand-800 tracking-tight">
            GCEE-AssessHub
          </h1>
          <p className="text-[#2C3E50] mt-2 text-sm font-medium">Institutional Grade Assessment Engine</p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-medium">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-black text-[#2C3E50] uppercase tracking-widest mb-2">Student/Faculty ID</label>
            <div className="flex bg-[#FFFFFF] rounded-xl border-2 border-[#4CAF50] hover:border-[#007ACC] focus-within:border-[#007ACC] focus-within:ring-4 focus-within:ring-[#4CAF50]/30 transition-all overflow-hidden shadow-sm">
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-transparent placeholder-[#2C3E50]/40 font-bold outline-none text-[#2C3E50] text-base"
                placeholder="Ex: alice"
                required
              />
              <div className="px-5 py-3 bg-[#F4F4F4] text-[#2C3E50]/70 font-black border-l-2 border-[#4CAF50] shrink-0 whitespace-nowrap text-base flex items-center">
                @gcee.ac.in
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-black text-[#2C3E50] uppercase tracking-widest mb-2">Password</label>
            <div className="relative flex bg-[#FFFFFF] rounded-xl border-2 border-[#4CAF50] hover:border-[#007ACC] focus-within:border-[#007ACC] focus-within:ring-4 focus-within:ring-[#4CAF50]/30 transition-all overflow-hidden shadow-sm">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-transparent placeholder-[#2C3E50]/40 font-bold outline-none text-[#2C3E50] text-base pr-12"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#2C3E50]/70 hover:text-[#007ACC] transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold btn-primary flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-brand-500/20"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Secure Login</span>
                <LogIn className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-[#4CAF50] text-center">
          <p className="text-xs text-[#2C3E50] font-medium">
            Authorized personnel only. All access is monitored.
          </p>
        </div>
      </div>
    </div>
  );
}
