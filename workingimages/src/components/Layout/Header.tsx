import React from 'react';
import { Music, LogOut, CreditCard } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import { products } from '../../stripe-config';

interface HeaderProps {
  onSubscriptionClick?: () => void;
}

export function Header({ onSubscriptionClick }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { subscription } = useSubscription();

  const getCurrentPlanName = () => {
    if (!subscription?.price_id) return 'Free';
    const product = products.find(p => p.priceId === subscription.price_id);
    return product?.name || 'Premium';
  };

  if (!user) return null;

  return (
    <header className="bg-black/20 backdrop-blur-lg border-b border-white/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Music size={32} className="text-purple-400" />
          <h1 className="text-2xl font-bold text-white">Piano XL</h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-300">{user.email}</p>
              <p className="text-xs text-purple-400 font-medium">
                {getCurrentPlanName()}
              </p>
            </div>
            
            {onSubscriptionClick && (
              <button
                onClick={onSubscriptionClick}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                title="Manage Subscription"
              >
                <CreditCard size={20} />
              </button>
            )}
            
            <button
              onClick={signOut}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}