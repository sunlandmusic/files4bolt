import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { products } from '../../stripe-config';
import { SubscriptionCard } from './SubscriptionCard';
import { ArrowLeft, Music } from 'lucide-react';

interface SubscriptionPageProps {
  onBack?: () => void;
}

interface SubscriptionData {
  subscription_status: string;
  price_id: string | null;
}

export function SubscriptionPage({ onBack }: SubscriptionPageProps) {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('subscription_status, price_id')
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
      } else {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (priceId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          price_id: priceId,
          mode: 'subscription',
          success_url: `${window.location.origin}/success`,
          cancel_url: `${window.location.origin}/subscription`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Subscription error:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/10"
            >
              <ArrowLeft size={24} />
            </button>
          )}
          <div className="flex items-center gap-3">
            <Music size={32} className="text-purple-400" />
            <h1 className="text-3xl font-bold text-white">Piano XL Subscription</h1>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <SubscriptionCard
              key={product.priceId}
              product={product}
              onSubscribe={handleSubscribe}
              isActive={subscription?.price_id === product.priceId && subscription?.subscription_status === 'active'}
            />
          ))}
        </div>

        {subscription && (
          <div className="mt-12 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Current Subscription</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300">Status: <span className="text-white font-medium capitalize">{subscription.subscription_status}</span></p>
                {subscription.price_id && (
                  <p className="text-gray-300 mt-1">
                    Plan: <span className="text-white font-medium">
                      {products.find(p => p.priceId === subscription.price_id)?.name || 'Unknown'}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}