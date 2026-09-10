import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react';

/**
 * SSOCallback.jsx
 *
 * Uses Clerk's official AuthenticateWithRedirectCallback to finalize the OAuth session
 * and automatically redirect to /dashboard.
 * The background MongoDB sync is handled seamlessly by ClerkAuthSync in App.jsx.
 */
const SSOCallback = () => {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#131315]">
      <AuthenticateWithRedirectCallback
        signInForceRedirectUrl="/dashboard"
        signUpForceRedirectUrl="/dashboard"
      />
      <div className="flex flex-col items-center gap-4">
        <span className="w-10 h-10 border-4 border-[#414751] border-t-[#60a5fa] rounded-full animate-spin" />
        <p className="font-inter text-sm text-[#c1c7d3]">Completing sign-in…</p>
      </div>
    </div>
  );
};

export default SSOCallback;
