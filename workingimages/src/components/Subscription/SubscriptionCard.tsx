import React, { useState } from 'react';
import { Product } from '../../stripe-config';
import { Crown, Loader2 } from 'lucide-react';

interface SubscriptionCardProps {
  product: Product;
  onSubscribe: (priceId: string) => Promise<void>;
  isActive?: boolean;
}

export function SubscriptionCard({ product, onSubscribe, isActive }: SubscriptionCardProps) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      await onSubscribe(product.priceId);
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border transition-all duration-300 ${
      isActive 
        ? 'border-purple-400 shadow-lg shadow-purple-500/25' 
        : 'border-white/20 hover:border-white/30'
    }`}>
      {isActive && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-purple-600 to-violet-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-2">
            <Crown size={16} />
            Current Plan
          </div>
        </div>
      )}

      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2">{product.name}</h3>
        <p className="text-gray-300 mb-6 leading-relaxed">{product.description}</p>
        
        <div className="mb-8">
          <span className="text-4xl font-bold text-white">${product.price}</span>
          <span className="text-gray-300 ml-2">/{product.mode === 'subscription' ? 'month' : 'one-time'}</span>
        </div>

        {!isActive && (
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                Subscribe Now
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}