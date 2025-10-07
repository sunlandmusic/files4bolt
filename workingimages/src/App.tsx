import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';

type View = 'landing' | 'login' | 'signup' | 'dashboard';
import { useAuth } from './hooks/useAuth';
import { AuthPage } from './components/Auth/AuthPage';
import { SubscriptionPage } from './components/Subscription/SubscriptionPage';
import { SuccessPage } from './components/Success/SuccessPage';
import { Header } from './components/Layout/Header';
import { useState } from 'react';

function App() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<'app' | 'subscription' | 'success'>('app');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage onSuccess={() => setCurrentPage('app')} />;
  }

  if (currentPage === 'subscription') {
    return <SubscriptionPage onBack={() => setCurrentPage('app')} />;
  }

  if (currentPage === 'success') {
    return <SuccessPage onContinue={() => setCurrentPage('app')} />;
  }

  const { user, loading } = useAuth();
  const [view, setView] = useState<View>('landing');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (user) {
    return <Dashboard />;
  }

  if (view === 'login') {
    return <Login onToggleMode={() => setView('signup')} />;
  }

  if (view === 'signup') {
    return <SignUp onToggleMode={() => setView('login')} />;
  }

  return (
    <div className="min-h-screen bg-black">
      <Header onSubscriptionClick={() => setCurrentPage('subscription')} />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <iframe
          src="/piano-xl.html"
          className="w-full h-[calc(100vh-80px)] border-0"
          title="Piano XL"
        />
      </div>
      onSignUp={() => setView('signup')}
    />
  );
}

export default App;

  )
}