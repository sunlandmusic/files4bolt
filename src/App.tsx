import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { AuthPage } from './components/Auth/AuthPage';
import { SubscriptionPage } from './components/Subscription/SubscriptionPage';
import { SuccessPage } from './components/Success/SuccessPage';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import { supabase } from './lib/supabase';

function App() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<'landing' | 'auth' | 'dashboard' | 'subscription' | 'success'>('landing');
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);

  useEffect(() => {
    // Check URL path to set initial page
    const path = window.location.pathname;
    if (path === '/auth') {
      setCurrentPage('auth');
    } else if (path === '/subscription') {
      setCurrentPage('subscription');
    } else if (path === '/success') {
      setCurrentPage('success');
    }
    
    if (user) {
      checkSubscriptionStatus();
    } else {
      setCheckingSubscription(false);
    }
  }, [user]);

  const checkSubscriptionStatus = async () => {
    if (!user) return;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_tier, tester_expires_at')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        setHasActiveSubscription(false);
      } else {
        let isActive = false;

        if (profile?.subscription_status === 'active') {
          if (profile?.subscription_tier === 'tester') {
            if (profile?.tester_expires_at) {
              isActive = new Date(profile.tester_expires_at) > new Date();
            } else {
              isActive = true;
            }
          } else {
            isActive = true;
          }
        }

        setHasActiveSubscription(isActive);

        if (!isActive && currentPage === 'dashboard') {
          setCurrentPage('subscription');
        }
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setHasActiveSubscription(false);
    } finally {
      setCheckingSubscription(false);
    }
  };

  if (loading || checkingSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-700 to-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    if (currentPage === 'auth') {
      return <AuthPage onSuccess={() => setCurrentPage('dashboard')} />;
    }
    return <LandingPage 
      onSignIn={() => setCurrentPage('auth')} 
      onSignUp={() => setCurrentPage('auth')} 
    />;
  }

  if (currentPage === 'subscription') {
    return <SubscriptionPage onBack={hasActiveSubscription ? () => setCurrentPage('dashboard') : undefined} />;
  }

  if (currentPage === 'success') {
    return <SuccessPage onContinue={() => {
      checkSubscriptionStatus();
      setCurrentPage('dashboard');
    }} />;
  }

  if (!hasActiveSubscription) {
    return <SubscriptionPage onBack={undefined} />;
  }

  return <Dashboard />;
}

export default App;
