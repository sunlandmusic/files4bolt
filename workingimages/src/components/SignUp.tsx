import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

type SignUpProps = {
  onToggleMode: () => void;
};

export default function SignUp({ onToggleMode }: SignUpProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password);

    if (error) {
      setError(error.message || 'Failed to create account');
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-[#1a1a1a] rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.8)] p-8 text-center border border-[#333]">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#4ade80] rounded-full mb-4">
              <img src="/490001 copy.png" alt="Elephant" className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Account Created!</h2>
            <p className="text-[#ccc] mb-6">
              Your account has been created successfully. You can now sign in.
            </p>
            <button
              onClick={onToggleMode}
              className="w-full bg-[#371d0b] hover:bg-[#4a2710] text-white font-medium py-3 px-4 rounded-lg transition-all shadow-[0_0_12px_rgba(55,29,11,0.6)] hover:shadow-[0_0_24px_rgba(55,29,11,0.8)]"
            >
              Go to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#371d0b] rounded-full mb-4 shadow-[0_0_24px_rgba(55,29,11,0.6)]">
            <img src="/490001 copy.png" alt="Elephant" className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">CHORD-INATOR • PIANO XL</h1>
          <p className="text-[#aaa]">Create your account</p>
        </div>

        <div className="bg-[#1a1a1a] rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.8)] p-8 border border-[#333]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#ccc] mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#333] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#371d0b] focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#ccc] mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#333] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#371d0b] focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#ccc] mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#333] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#371d0b] focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ff8c00] hover:bg-[#ff9d1a] text-black font-medium py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_12px_rgba(255,140,0,0.6)] hover:shadow-[0_0_24px_rgba(255,140,0,0.8)]"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={onToggleMode}
              className="text-[#371d0b] hover:text-[#4a2710] text-sm transition-colors"
            >
              Already have an account? Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
