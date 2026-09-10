import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useClerk } from '@clerk/clerk-react';
import { logout } from '../../store/slices/authSlice';

const hasClerkKey = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

const ClerkLogoutButton = ({ onLogout }) => {
  const clerk = useClerk();
  return (
    <button
      onClick={async () => {
        try {
          await clerk.signOut();
        } catch {}
        onLogout();
      }}
      className="flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50 transition-all duration-200 rounded-lg w-full text-left active:scale-95"
    >
      <span className="material-symbols-outlined">logout</span>
      <span>Log Out</span>
    </button>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = user?.role === 'customer' 
    ? [
        { name: 'Shop', path: '/shop', icon: 'storefront' },
        { name: 'My Orders', path: '/orders', icon: 'shopping_bag' },
        { name: 'Store Locator', path: '/locator', icon: 'map' },
        { name: 'Profile', path: '/settings', icon: 'person' },
      ]
    : [
        { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
        { name: 'Inventory', path: '/inventory', icon: 'inventory_2' },
        { name: 'Orders', path: '/orders', icon: 'shopping_cart' },
        { name: 'Customers', path: '/customers', icon: 'group' },
        { name: 'Store Locator', path: '/locator', icon: 'map' },
        { name: 'Settings', path: '/settings', icon: 'settings' },
      ];

  return (
    <nav className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 border-r border-zinc-800 bg-zinc-950 py-6 z-50">
      {/* Brand */}
      <Link to={user ? "/dashboard" : "/"} className="px-6 mb-8 flex items-center gap-3 outline-none group">
        <div className="w-8 h-8 rounded-lg bg-primary-container/20 flex items-center justify-center border border-primary-container/30 group-hover:scale-110 transition-transform">
          <span className="material-symbols-outlined text-primary-container" style={{ fontSize: '20px' }}>storefront</span>
        </div>
        <div>
          <h1 className="font-manrope text-lg font-extrabold tracking-tighter text-white leading-none">OmniRetail</h1>
          <p className="font-inter text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant mt-0.5">Management Portal</p>
        </div>
      </Link>

      {/* Main Nav */}
      <div className="flex-1 flex flex-col gap-1 font-inter text-sm font-medium">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 group ${
                isActive
                  ? 'text-primary-container bg-primary-container/5 border-r-4 border-primary-container shadow-[0_0_20px_rgba(96,165,250,0.15)]'
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50 active:scale-95'
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer Nav — always visible with border-t separator, matching HTML design */}
      <div className="mt-auto flex flex-col gap-1 border-t border-zinc-800/70 pt-4 mx-4 font-inter text-sm font-medium">
        <Link
          to="/support"
          className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 rounded-lg active:scale-95 ${
            location.pathname === '/support'
              ? 'text-primary-container bg-primary-container/5 border-r-4 border-primary-container'
              : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50'
          }`}
        >
          <span className="material-symbols-outlined" style={location.pathname === '/support' ? { fontVariationSettings: "'FILL' 1" } : {}}>help</span>
          <span>Support</span>
        </Link>
        {hasClerkKey ? (
          <ClerkLogoutButton onLogout={handleLogout} />
        ) : (
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50 transition-all duration-200 rounded-lg w-full text-left active:scale-95"
          >
            <span className="material-symbols-outlined">logout</span>
            <span>Log Out</span>
          </button>
        )}
      </div>
    </nav>
  );
};

export default Sidebar;
