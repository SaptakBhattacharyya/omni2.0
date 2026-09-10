import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';
import authApi from '../../api/authApi';

/**
 * SSOCallback.jsx
 *
 * This page handles the Clerk OAuth redirect after Google sign-in/sign-up.
 * Clerk redirects the user back here after authenticating with Google.
 * We then sync the Clerk user with our MongoDB backend to get our app's JWT.
 *
 * Flow:
 *   1. User clicks "Continue with Google" → Clerk opens Google OAuth
 *   2. Google authenticates user → redirects back to /sso-callback
 *   3. Clerk processes the session → `isSignedIn` becomes true
 *   4. We call our backend `clerkSync` to get/create MongoDB user + JWT
 *   5. Store credentials in Redux + localStorage → redirect to /dashboard
 */
const SSOCallback = () => {
  const { handleRedirectCallback } = useClerk();
  const { user: clerkUser, isSignedIn, isLoaded } = useUser();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const hasSynced = useRef(false);

  // Step 1: Let Clerk finish processing the OAuth redirect
  useEffect(() => {
    handleRedirectCallback({
      afterSignInUrl: window.location.href,
      afterSignUpUrl: window.location.href,
    }).catch(() => {
      // If handleRedirectCallback fails it might already be handled
      // Just let the isSignedIn effect take over
    });
  }, []);

  // Step 2: Once Clerk has confirmed the user is signed in, sync with backend
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !clerkUser || hasSynced.current) return;

    hasSynced.current = true;

    // Read the role that was stored before the OAuth redirect
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
        navigate('/dashboard', { replace: true });
      })
      .catch((err) => {
        console.error('[SSOCallback] clerkSync failed:', err);
        navigate(`/login?error=${encodeURIComponent(err.message || 'Google sign-in failed')}`, {
          replace: true,
        });
      });
  }, [isLoaded, isSignedIn, clerkUser]);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#131315]">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <span className="w-10 h-10 border-4 border-[#414751] border-t-[#60a5fa] rounded-full animate-spin" />
        <p className="font-inter text-sm text-[#c1c7d3]">Completing sign-in…</p>
      </div>
    </div>
  );
};

export default SSOCallback;
