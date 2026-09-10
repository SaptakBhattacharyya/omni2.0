import { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useUser } from '@clerk/clerk-react';
import { setCredentials, logout } from './store/slices/authSlice';
import authApi from './api/authApi';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import SSOCallback from './pages/Auth/SSOCallback';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Home from './pages/Home';
import Inventory from './pages/Inventory';
import ProductDetail from './pages/ProductDetail';
import Negotiation from './pages/Negotiation';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import StoreLocator from './pages/StoreLocator';
import Settings from './pages/Settings';
import Support from './pages/Support';
import Landing from './pages/Landing';
import './index.css';

const hasClerkKey = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

// Background sync component: when Clerk is signed in, ensures backend MongoDB has the user & Redux has the JWT
const ClerkAuthSync = () => {
  const { user: clerkUser, isSignedIn, isLoaded } = useUser();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const syncingRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !clerkUser || isAuthenticated || syncingRef.current) return;

    syncingRef.current = true;
    const pendingRole = sessionStorage.getItem('clerk_pending_role') || 'customer';
    const pendingCategory = sessionStorage.getItem('clerk_pending_category') || undefined;
    sessionStorage.removeItem('clerk_pending_role');
    sessionStorage.removeItem('clerk_pending_category');

    const payload = {
      clerkId: clerkUser.id,
      email: clerkUser.primaryEmailAddress?.emailAddress,
      name: clerkUser.fullName || clerkUser.firstName || 'OmniRetail User',
      avatar: clerkUser.imageUrl,
      role: pendingRole,
      retailerCategory: pendingRole === 'retailer' ? pendingCategory : undefined,
    };

    authApi
      .clerkSync(payload)
      .then((data) => {
        dispatch(setCredentials({ user: data, token: data.token }));
      })
      .catch((err) => {
        console.error('[ClerkAuthSync] clerkSync failed:', err);
      })
      .finally(() => {
        syncingRef.current = false;
      });
  }, [isLoaded, isSignedIn, clerkUser, isAuthenticated, dispatch]);

  return null;
};

// Dashboard Layout Wrapper
const DashboardLayout = ({ children }) => (
  <div className="flex min-h-screen bg-[#131315]">
    <Sidebar />
    <div className="flex-1 flex flex-col md:ml-64 w-full h-screen overflow-y-auto relative">
      <div className="fixed top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none"></div>
      <Header />
      <main className="p-8 pb-20 relative z-10 flex-1 flex flex-col gap-6 max-w-[1600px] mx-auto w-full">
        {children}
      </main>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      {hasClerkKey && <ClerkAuthSync />}
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Clerk SSO Callback — handles Google OAuth redirect */}
        {hasClerkKey && <Route path="/sso-callback" element={<SSOCallback />} />}
        
        {/* Protected Dashboard Route */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Home />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route path="/shop" element={<ProtectedRoute><DashboardLayout><Inventory /></DashboardLayout></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><DashboardLayout><Inventory /></DashboardLayout></ProtectedRoute>} />
        <Route path="/product/:id" element={<ProtectedRoute><DashboardLayout><ProductDetail /></DashboardLayout></ProtectedRoute>} />
        <Route path="/negotiation/:id" element={<ProtectedRoute><DashboardLayout><Negotiation /></DashboardLayout></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><DashboardLayout><Orders /></DashboardLayout></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute><DashboardLayout><Customers /></DashboardLayout></ProtectedRoute>} />
        <Route path="/locator" element={<ProtectedRoute><DashboardLayout><StoreLocator /></DashboardLayout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><DashboardLayout><Settings /></DashboardLayout></ProtectedRoute>} />
        <Route path="/support" element={<ProtectedRoute><DashboardLayout><Support /></DashboardLayout></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}


export default App;
