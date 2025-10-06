import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';

export default function Dashboard() {
  const { user, profile, signOut } = useAuth();

  useEffect(() => {
    // Auto-redirect to CHORD-INATOR after 2 seconds
    const timer = setTimeout(() => {
      window.location.href = '/chord-inator';
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const goToChordinator = () => {
    window.location.href = '/chord-inator';
  };

  return (
    <div className="min-h-screen bg-black">
      <nav className="border-b border-[#333] bg-black/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img src="/490001 copy.png" alt="Elephant" className="w-8 h-8" />
              <span className="text-xl font-bold text-white">CHORD-INATOR • PIANO XL</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-[#ccc]">
                {user?.email}
              </div>
              <button
                onClick={signOut}
                className="flex items-center space-x-2 text-[#aaa] hover:text-white transition-colors px-4 py-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#371d0b] rounded-full mb-6 animate-pulse shadow-[0_0_32px_rgba(55,29,11,0.8)]">
            <img src="/490001 copy.png" alt="Elephant" className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome Back!
          </h1>
          <p className="text-xl text-[#ccc] mb-8">
            Redirecting you to CHORD-INATOR...
          </p>

          <div className="bg-[#1a1a1a] rounded-xl p-8 border border-[#333] max-w-md mx-auto shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
            <div className="mb-6">
              <div className="text-sm text-[#888] mb-2">Account Status</div>
              <div className="inline-block px-4 py-2 bg-[#371d0b] text-white rounded-lg font-medium">
                {profile?.subscription_status || 'Free'}
              </div>
            </div>

            <button
              onClick={goToChordinator}
              className="flex items-center justify-center space-x-2 bg-[#371d0b] hover:bg-[#4a2410] text-white px-6 py-3 rounded-lg font-medium shadow-[0_0_12px_rgba(55,29,11,0.6)] transition-colors cursor-pointer w-full"
            >
              <span>Go to CHORD-INATOR</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
