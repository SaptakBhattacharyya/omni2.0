import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useUser } from '@clerk/clerk-react';

const hasClerkKey = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const clerk = hasClerkKey ? useUser() : { isLoaded: true, isSignedIn: false };

  // If Clerk is still authenticating or user signed in with Clerk but backend JWT not yet synced
  if (hasClerkKey && (!clerk.isLoaded || (clerk.isSignedIn && !isAuthenticated))) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#131315]">
        <div className="flex flex-col items-center gap-4">
          <span className="w-10 h-10 border-4 border-[#414751] border-t-[#60a5fa] rounded-full animate-spin" />
          <p className="font-inter text-sm text-[#c1c7d3]">Setting up your session…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
