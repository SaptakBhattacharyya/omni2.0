import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';
import authApi from '../../api/authApi';
import { getStoreCategories } from '../../api/productsApi';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [role, setRole] = useState('customer');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    storeName: '', storeCategory: '', password: '', confirmPassword: '', terms: false,
  });

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
        setError('Google Sign-up failed. Please try again.');
      }
    }
  }, [location, dispatch, navigate]);

  const handleGoogleSignup = () => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
    const cleanBase = apiBase.replace(/\/+$/, '');
    const origin = encodeURIComponent(window.location.origin);
    window.location.href = `${cleanBase}/users/auth/google?origin=${origin}&role=${role}`;
  };

  const storeCategories = getStoreCategories();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }
    
    setLoading(true);
    setError('');

    try {
      const payload = {
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        password: form.password,
        role: role,
        retailerCategory: role === 'retailer' ? form.storeCategory : undefined
      };

      const data = await authApi.register(payload);
      dispatch(setCredentials({ user: data, token: data.token }));
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-white/5 border border-white/10 rounded-[10px] px-3 py-2.5 text-[14px] text-[#e5e1e4] placeholder:text-[#8b919d] outline-none transition-all focus:border-[#60a5fa] focus:shadow-[0_0_0_3px_rgba(96,165,250,0.15)]';

  const features = [
    'Free forever for consumers',
    'Real-time stock at 20+ partner stores',
    'AI negotiation engine with 3-round system',
    'Order history & receipt tracking',
  ];

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[#131315] text-[#e5e1e4] font-inter antialiased">

      {/* ── Left Brand Panel ── */}
      <div className="hidden lg:flex w-5/12 relative flex-col justify-between p-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1b35] via-[#131315] to-[#0a1f1a]" />
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none animate-[pglow_3s_ease-in-out_infinite]" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-emerald-500/[0.08] rounded-full blur-[90px] pointer-events-none animate-[pglow_3s_ease-in-out_infinite] [animation-delay:2s]" />

        {/* Brand */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#60a5fa]/20 border border-[#60a5fa]/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#60a5fa]" style={{ fontSize: '20px' }}>storefront</span>
            </div>
            <span className="text-xl font-black tracking-tight text-white font-manrope">OmniRetail</span>
          </Link>
        </div>

        {/* Hero */}
        <div className="relative z-10">
          <h2 className="font-manrope text-[28px] font-bold text-white mb-3 tracking-[-0.02em]">
            Join thousands of<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">smart shoppers.</span>
          </h2>
          <p className="font-inter text-sm text-[#c1c7d3] max-w-xs mb-6">
            Access real-time shelf-level inventory and negotiate prices on any product, anytime.
          </p>
          <div className="flex flex-col gap-2.5">
            {features.map((feat) => (
              <div key={feat} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-[#4edea3]/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#4edea3]" style={{ fontSize: '14px' }}>check</span>
                </span>
                <span className="font-inter text-sm text-[#c1c7d3]">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="w-10 h-10 rounded-full bg-[#353437] border border-[#414751] shrink-0 flex items-center justify-center font-manrope text-sm text-[#c1c7d3]">SK</div>
          <div>
            <p className="font-inter text-sm font-semibold text-white">"Saved ₹4,500 on headphones with one negotiation!"</p>
            <p className="font-inter text-xs text-[#c1c7d3] mt-0.5">Saptak K. · Verified Consumer</p>
          </div>
        </div>
      </div>

      {/* ── Right Register Panel — full height, internal hidden scroll ── */}
      <div
        className="flex-1 h-full flex items-start justify-center py-6 px-6 lg:px-12 relative bg-[#1c1b1d] lg:bg-[#131315] overflow-y-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>

        {/* Mobile brand */}
        <div className="lg:hidden absolute top-5 left-5 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#60a5fa]/20 border border-[#60a5fa]/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#60a5fa]" style={{ fontSize: '18px' }}>storefront</span>
          </div>
          <span className="text-lg font-black tracking-tight text-white font-manrope">OmniRetail</span>
        </div>

        <div className="relative z-10 w-full max-w-lg mt-4 lg:mt-auto lg:mb-auto lg:my-auto">
          {/* Card */}
          <div
            className="bg-[#201f22] border border-[#414751] rounded-2xl p-6"
            style={{ boxShadow: '0 0 0 1px rgba(255,255,255,.05) inset, 0 24px 48px rgba(0,0,0,.5)' }}
          >
            {/* Header */}
            <div className="mb-4">
              <h2 className="font-manrope text-[26px] font-bold text-white mb-0.5 tracking-[-0.02em]">Create your account</h2>
              <p className="font-inter text-sm text-[#c1c7d3]">
                Already have one?{' '}
                <Link to="/login" className="text-[#60a5fa] hover:text-[#a4c9ff] font-semibold transition-colors">Sign in</Link>
              </p>
            </div>

            {/* Role Cards */}
            <div className="mb-4">
              <p className="font-inter text-[11px] font-semibold uppercase tracking-[0.05em] text-[#c1c7d3] mb-2">I am a...</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'customer', icon: 'person', iconColor: 'text-[#60a5fa]', iconBg: 'bg-[#60a5fa]/20', label: 'Customer', sub: 'Browse, find stock & negotiate' },
                  { id: 'retailer', icon: 'store', iconColor: 'text-[#4edea3]', iconBg: 'bg-[#4edea3]/20', label: 'Retailer', sub: 'Manage inventory & negotiate' },
                ].map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={`cursor-pointer rounded-xl p-3 transition-all border-2 ${
                      role === r.id
                        ? 'border-[#60a5fa] bg-[#60a5fa]/8 shadow-[0_0_16px_rgba(96,165,250,.15)]'
                        : 'border-white/[0.08] bg-white/[0.03] hover:border-[#60a5fa]/30 hover:bg-[#60a5fa]/5'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg ${r.iconBg} flex items-center justify-center mb-2`}>
                      <span className={`material-symbols-outlined ${r.iconColor}`} style={{ fontSize: '16px' }}>{r.icon}</span>
                    </div>
                    <p className="font-inter text-sm font-semibold text-[#e5e1e4]">{r.label}</p>
                    <p className="font-inter text-xs text-[#c1c7d3] mt-0.5">{r.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                <span className="material-symbols-outlined text-red-400 text-[18px]">error</span>
                <p className="font-inter text-xs text-red-200">{error}</p>
              </div>
            )}

            {/* Social Signup */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="w-full flex items-center justify-center gap-3 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all mb-4 group outline-none"
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
              <span className="font-inter text-sm font-semibold text-white">Sign up with Google</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 h-px bg-[#414751]" />
              <span className="font-inter text-[11px] font-bold uppercase tracking-widest text-[#8b919d]">or</span>
              <div className="flex-1 h-px bg-[#414751]" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">

              {/* First + Last Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-inter text-[11px] font-semibold uppercase tracking-[0.05em] text-[#c1c7d3] mb-1.5">First Name</label>
                  <input type="text" placeholder="Saptak" required value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block font-inter text-[11px] font-semibold uppercase tracking-[0.05em] text-[#c1c7d3] mb-1.5">Last Name</label>
                  <input type="text" placeholder="Bhattacharyya" required value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={inputClass} />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block font-inter text-[11px] font-semibold uppercase tracking-[0.05em] text-[#c1c7d3] mb-1.5">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8b919d]" style={{ fontSize: '17px' }}>mail</span>
                  <input type="email" placeholder="you@example.com" required value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })} className={`${inputClass} pl-10`} />
                </div>
              </div>

              {/* Store Details (Retailer only) */}
              {role === 'retailer' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-inter text-[11px] font-semibold uppercase tracking-[0.05em] text-[#c1c7d3] mb-1.5">Store / Business Name</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8b919d]" style={{ fontSize: '17px' }}>store</span>
                      <input type="text" placeholder="My Awesome Store" value={form.storeName} required={role === 'retailer'}
                        onChange={(e) => setForm({ ...form, storeName: e.target.value })} className={`${inputClass} pl-10`} />
                    </div>
                  </div>
                  <div>
                    <label className="block font-inter text-[11px] font-semibold uppercase tracking-[0.05em] text-[#c1c7d3] mb-1.5">Store Category</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8b919d]" style={{ fontSize: '17px' }}>category</span>
                      <select value={form.storeCategory} required={role === 'retailer'}
                        onChange={(e) => setForm({ ...form, storeCategory: e.target.value })} 
                        className={`${inputClass} pl-10 appearance-none`}
                        style={{ backgroundImage: 'none' }}
                      >
                        <option value="" disabled className="bg-[#201f22]">Select Category</option>
                        {storeCategories.map(cat => (
                          <option key={cat.value} value={cat.value} className="bg-[#201f22]">{cat.label}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#8b919d] pointer-events-none" style={{ fontSize: '17px' }}>expand_more</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Password + Confirm side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-inter text-[11px] font-semibold uppercase tracking-[0.05em] text-[#c1c7d3] mb-1.5">Password</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8b919d]" style={{ fontSize: '17px' }}>lock</span>
                    <input type={showPwd ? 'text' : 'password'} placeholder="Min. 8 chars" required value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })} className={`${inputClass} pl-10 pr-10`} />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b919d] hover:text-[#e5e1e4] transition-colors outline-none">
                      <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>{showPwd ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block font-inter text-[11px] font-semibold uppercase tracking-[0.05em] text-[#c1c7d3] mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8b919d]" style={{ fontSize: '17px' }}>lock</span>
                    <input type="password" placeholder="••••••••" required value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className={`${inputClass} pl-10`} />
                  </div>
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" required checked={form.terms}
                  onChange={(e) => setForm({ ...form, terms: e.target.checked })}
                  className="mt-0.5 w-4 h-4 rounded border-[#414751] bg-[#201f22] accent-[#60a5fa] shrink-0" />
                <p className="font-inter text-xs text-[#c1c7d3]">
                  I agree to OmniRetail's{' '}
                  <a href="#" className="text-[#60a5fa] hover:underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-[#60a5fa] hover:underline">Privacy Policy</a>.
                </p>
              </label>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-[#60a5fa] text-[#003a6b] font-manrope text-base font-bold rounded-xl hover:brightness-110 transition-all shadow-[0_0_20px_rgba(96,165,250,.3)] active:scale-[.98] flex items-center justify-center gap-2 disabled:opacity-70">
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#003a6b]/30 border-t-[#003a6b] rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`@keyframes pglow { 0%,100%{opacity:.3} 50%{opacity:.7} }`}</style>
    </div>
  );
};

export default Register;
