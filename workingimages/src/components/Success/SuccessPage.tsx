import React, { useEffect } from 'react';
import { CheckCircle, Music, ArrowRight } from 'lucide-react';

interface SuccessPageProps {
  onContinue?: () => void;
}

export function SuccessPage({ onContinue }: SuccessPageProps) {
  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      onContinue?.();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-12 w-full max-w-md border border-white/20 text-center">
        <div className="mb-8">
          <CheckCircle size={80} className="text-green-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">Payment Successful!</h1>
          <p className="text-gray-300 leading-relaxed">
            Thank you for subscribing to Piano XL. Your subscription is now active and you have full access to all features.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={onContinue}
            className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Music size={20} />
            Start Creating Music
            <ArrowRight size={20} />
          </button>
          
          <p className="text-sm text-gray-400">
            Redirecting automatically in 5 seconds...
          </p>
        </div>
      </div>
    </div>
  );
}