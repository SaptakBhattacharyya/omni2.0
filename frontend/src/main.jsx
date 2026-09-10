import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import { store } from './store'
import { HelmetProvider } from 'react-helmet-async';
import { ClerkProvider } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import './index.css'
import App from './App.jsx'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          {PUBLISHABLE_KEY ? (
            <ClerkProvider
              publishableKey={PUBLISHABLE_KEY}
              signInUrl="/login"
              signUpUrl="/register"
              signInFallbackRedirectUrl="/dashboard"
              signUpFallbackRedirectUrl="/dashboard"
              allowedRedirectOrigins={[
                'https://omni2-0-ymx3.vercel.app',
                'https://omni2-0-ymx3-git-main-saptak-bhattacharyyas-projects.vercel.app',
                'https://omni2-0.vercel.app',
                typeof window !== 'undefined' ? window.location.origin : '',
                /https:\/\/.*\.vercel\.app/,
              ]}
              appearance={{
                baseTheme: dark,
                variables: {
                  colorPrimary: '#60a5fa',
                  colorBackground: '#131315',
                  colorInputBackground: '#201f22',
                  colorInputText: '#e5e1e4',
                  colorText: '#e5e1e4',
                  colorTextSecondary: '#8b919d',
                },
              }}
            >
              <App />
            </ClerkProvider>
          ) : (
            <App />
          )}
        </HelmetProvider>
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
)
