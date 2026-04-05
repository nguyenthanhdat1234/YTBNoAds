import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { Play, Lock, Eye, EyeOff, Loader2, PlayCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Artificial delay for cinematic effect
    setTimeout(() => {
      if (login(password)) {
        toast.success(t('auth.loginSuccess', 'Authorized // Access Granted'));
        navigate(from, { replace: true });
      } else {
        toast.error(t('auth.loginError', 'Unauthorized // Access Denied'));
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-cinema-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Cinematic Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cinema-red blur-[150px] opacity-10 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cinema-red blur-[150px] opacity-10 animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo Section */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-white/[0.02] border border-white/5 rounded-sm mb-6">
             <img src="/logo.png" alt="Cinema Flow" className="h-10 w-auto" />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-[0.2em] text-white">
            Cinema <span className="text-cinema-red">Flow</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cinema-gray/40">
            Digital Production Console // v0.2.1
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-10 space-y-8 animate-slide-up">
          <div className="space-y-2 border-l-2 border-cinema-red pl-5">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white">
              {t('auth.authorizationTitle', 'System Authorization')}
            </h2>
            <p className="text-[10px] font-medium text-cinema-gray/60 uppercase tracking-widest">
              {t('auth.protocolInfo', 'Please initialize your session protocols to proceed.')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-cinema-red opacity-40 group-focus-within:opacity-100 transition-opacity" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.passcodePlaceholder', 'SECURITY PASSCODE')}
                  className="w-full bg-white/[0.01] border border-white/5 focus:border-white/20 focus:bg-white/[0.03] text-white placeholder:text-cinema-gray/10 pl-14 pr-14 py-5 text-[11px] font-black uppercase tracking-[0.4em] rounded-sm transition-all focus:ring-0"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-5 flex items-center text-cinema-gray/20 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cinema-red hover:bg-red-700 text-white py-5 rounded-sm flex items-center justify-center space-x-4 transition-all duration-500 shadow-2xl shadow-cinema-red/20 group relative overflow-hidden"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-[0.5em]">{t('auth.authenticating', 'Authenticating Unit')}</span>
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-[0.5em]">{t('auth.initializeSession', 'Initialize Session')}</span>
                </>
              )}
            </button>
          </form>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
             <div className="flex items-center space-x-2 text-[8px] font-black uppercase tracking-widest text-cinema-gray/30">
                <ShieldCheck className="w-3 h-3 text-cinema-red/40" />
                <span>{t('auth.footerInfo', 'Authorized Personnel Only // AES-256 Vault Protocol')}</span>
             </div>
          </div>
        </div>

        {/* Help Link */}
        <div className="mt-12 text-center">
           <p className="text-[9px] font-black uppercase tracking-[0.3em] text-cinema-gray/20">
              Session Timeout: 12H // Passcode: cinemaflow
           </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
