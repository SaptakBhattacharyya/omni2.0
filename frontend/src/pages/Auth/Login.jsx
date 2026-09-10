import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';
import authApi from '../../api/authApi';
import SEO from '../../components/common/SEO';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [role, setRole] = useState('customer');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });

  const location = useLocation();

  useEffect(() => {
    // Check if redirected from Google Auth
    const params = new URLSearchParams(location.search);
    const dataStr = params.get('data');
    const errorParam = params.get('error');

    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    } else if (dataStr) {
      try {
        const data = JSON.parse(decodeURIComponent(dataStr));
        dispatch(setCredentials({ user: data, token: data.token }));
        navigate('/');
      } catch (err) {
        setError('Google Login failed. Please try again.');
      }
    }
  }, [location, dispatch, navigate]);

  const handleGoogleLogin = () => {
    // Use configured API base URL (e.g. https://omni2-0.vercel.app/api/v1 or http://localhost:5000/api/v1)
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
    const cleanBase = apiBase.replace(/\/+$/, '');
    const origin = encodeURIComponent(window.location.origin);
    window.location.href = `${cleanBase}/users/auth/google?origin=${origin}&role=${role}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await authApi.login(form);
      dispatch(setCredentials({ user: data, token: data.token }));
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[#131315] text-[#e5e1e4] font-inter antialiased">
      <SEO 
        title="Sign In" 
        description="Access your OmniRetail account to manage your hybrid store or start shopping locally."
      />

      {/* ── Left Brand Panel ── */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1b35] via-[#131315] to-[#0a1f1a]" />
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none animate-[pglow_3s_ease-in-out_infinite]" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-emerald-500/[0.08] rounded-full blur-[100px] pointer-events-none animate-[pglow_3s_ease-in-out_infinite] [animation-delay:1.5s]" />

        {/* Brand logo */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#60a5fa]/20 border border-[#60a5fa]/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#60a5fa]" style={{ fontSize: '20px' }}>storefront</span>
            </div>
            <span className="text-xl font-black tracking-tight text-white font-manrope">OmniRetail</span>
          </Link>
        </div>

        {/* Hero text — floating animation */}
        <div className="relative z-10 animate-[float_6s_ease-in-out_infinite]">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#4edea3]/10 border border-[#4edea3]/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#4edea3] shadow-[0_0_8px_rgba(78,222,163,0.8)]" />
            <span className="font-inter text-[12px] font-semibold uppercase tracking-[0.05em] text-[#4edea3]">
              Real-time inventory + AI negotiation
            </span>
          </div>
          <h1 className="font-manrope text-[48px] font-extrabold text-white mb-4 leading-[1.1] tracking-[-0.04em]">
            Retail,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              reimagined.
            </span>
          </h1>
          <p className="font-inter text-base text-[#c1c7d3] max-w-sm">
            Find products in stock at your nearest store. Negotiate prices in real-time. One platform, both channels.
          </p>
        </div>

        {/* Feature pills */}
        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="w-9 h-9 rounded-lg bg-[#60a5fa]/15 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#60a5fa]" style={{ fontSize: '18px' }}>location_on</span>
            </div>
            <div>
              <p className="font-inter text-sm font-semibold text-white">Shelf-level Stock Visibility</p>
              <p className="font-inter text-xs text-[#c1c7d3]">Know exactly what's in stock before you visit.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="w-9 h-9 rounded-lg bg-[#4edea3]/15 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#4edea3]" style={{ fontSize: '18px' }}>handshake</span>
            </div>
            <div>
              <p className="font-inter text-sm font-semibold text-white">AI Price Negotiation</p>
              <p className="font-inter text-xs text-[#c1c7d3]">Make offers. Get fair counter-offers instantly.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Auth Panel ── */}
      <div className="flex-1 flex items-center justify-center p-8 relative bg-[#1c1b1d] lg:bg-[#131315]">

        {/* Mobile brand (hidden on lg) */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#60a5fa]/20 border border-[#60a5fa]/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#60a5fa]" style={{ fontSize: '18px' }}>storefront</span>
          </div>
          <span className="text-lg font-black tracking-tight text-white font-manrope">OmniRetail</span>
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Card */}
          <div
            className="bg-[#201f22] border border-[#414751] rounded-2xl p-8"
            style={{ boxShadow: '0 0 0 1px rgba(255,255,255,.05) inset, 0 32px 64px rgba(0,0,0,.6)' }}
          >
            {/* Header */}
            <div className="mb-8">
              <h2 className="font-manrope text-[32px] font-bold text-white mb-2 tracking-[-0.02em]">Welcome back</h2>
              <p className="font-inter text-sm text-[#c1c7d3]">Sign in to your OmniRetail account.</p>
            </div>

            {/* Role Toggle */}
            <div className="flex p-1 bg-[#131315] rounded-xl border border-[#414751] mb-6">
              {['customer', 'retailer'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex-1 py-2.5 rounded-lg font-inter text-[12px] font-semibold uppercase tracking-[0.05em] transition-all ${
                    role === r
                      ? 'bg-[#60a5fa] text-[#003a6b] shadow-[0_0_12px_rgba(96,165,250,.3)]'
                      : 'text-[#c1c7d3] hover:text-[#e5e1e4]'
                  }`}
                >
                  {r === 'customer' ? 'Customer' : 'Retailer'}
                </button>
              ))}
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 animate-shake">
                <span className="material-symbols-outlined text-red-400 text-[18px]">error</span>
                <p className="font-inter text-xs text-red-200">{error}</p>
              </div>
            )}

            {/* Social Login */}
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all mb-6 group outline-none"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="font-inter text-sm font-semibold text-white">Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-[#414751]" />
              <span className="font-inter text-[11px] font-bold uppercase tracking-widest text-[#8b919d]">or</span>
              <div className="flex-1 h-px bg-[#414751]" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Email */}
              <div>
                <label className="block font-inter text-[12px] font-semibold uppercase tracking-[0.05em] text-[#c1c7d3] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#8b919d]" style={{ fontSize: '18px' }}>
                    mail
                  </span>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-[10px] px-4 py-3 pl-11 text-[15px] text-[#e5e1e4] placeholder:text-[#8b919d] outline-none transition-all focus:border-[#60a5fa] focus:shadow-[0_0_0_3px_rgba(96,165,250,0.15)]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="font-inter text-[12px] font-semibold uppercase tracking-[0.05em] text-[#c1c7d3]">
                    Password
                  </label>
                  <a href="#" className="font-inter text-[12px] font-semibold uppercase tracking-[0.05em] text-[#60a5fa] hover:text-[#a4c9ff] transition-colors">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#8b919d]" style={{ fontSize: '18px' }}>
                    lock
                  </span>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-[10px] px-4 py-3 pl-11 pr-12 text-[15px] text-[#e5e1e4] placeholder:text-[#8b919d] outline-none transition-all focus:border-[#60a5fa] focus:shadow-[0_0_0_3px_rgba(96,165,250,0.15)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8b919d] hover:text-[#e5e1e4] transition-colors outline-none"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      {showPwd ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#60a5fa] text-[#003a6b] font-manrope text-base font-bold rounded-xl hover:brightness-110 transition-all shadow-[0_0_20px_rgba(96,165,250,.3)] active:scale-[.98] flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#003a6b]/30 border-t-[#003a6b] rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-[#414751]" />
              <span className="font-inter text-[12px] font-semibold uppercase tracking-[0.05em] text-[#8b919d]">or</span>
              <div className="flex-1 h-px bg-[#414751]" />
            </div>

            {/* Register link */}
            <p className="text-center font-inter text-sm text-[#c1c7d3]">
              Don't have an account?
              <Link to="/register" className="text-[#60a5fa] hover:text-[#a4c9ff] font-semibold transition-colors ml-1">
                Create one free
              </Link>
            </p>
          </div>

          <p className="text-center font-inter text-[12px] text-[#8b919d] mt-6">
            By signing in you agree to OmniRetail's Terms &amp; Privacy Policy.
          </p>
        </div>
      </div>

      {/* Keyframe styles injected inline */}
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes pglow { 0%,100%{opacity:.3} 50%{opacity:.7} }
      `}</style>
    </div>
  );
};

export default Login;
