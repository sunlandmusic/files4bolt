# CHORD-INATOR Rebuild Documentation

## Overview
This document contains everything needed to rebuild the CHORD-INATOR app from scratch. The app is a React + TypeScript + Vite app with Supabase authentication and a piano interface loaded in an iframe.

---

## 1. DATABASE SETUP

### Migration 1: Create Profiles Table
**File:** `supabase/migrations/20251006232459_create_profiles_table.sql`

```sql
/*
  # Create profiles table for user data

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `profiles` table
    - Add policy for users to read their own profile
    - Add policy for users to update their own profile
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
```

### Migration 2: Create Profile Trigger
**File:** `supabase/migrations/20251006232509_create_profile_trigger.sql`

```sql
/*
  # Create trigger to auto-create profiles

  1. Changes
    - Create function to handle new user creation
    - Create trigger to automatically create profile when user signs up
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Apply migrations using:**
- Use `mcp__supabase__apply_migration` tool with the above content

---

## 2. SUPABASE CLIENT SETUP

### File: `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Environment Variables (.env)
```
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## 3. AUTHENTICATION CONTEXT

### File: `src/contexts/AuthContext.tsx`

```typescript
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

---

## 4. AUTHENTICATION COMPONENT

### File: `src/components/Auth.tsx`

```typescript
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: authError } = isSignUp
        ? await signUp(email, password)
        : await signIn(email, password);

      if (authError) {
        setError(authError.message);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-br from-purple-900/50 to-black border border-purple-700 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-light text-white mb-2 tracking-widest">
              CHORD-INATOR
            </h1>
            <p className="text-purple-300 text-sm">
              {isSignUp ? 'Create your account' : 'Sign in to continue'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-gray-400 text-sm mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-black border border-purple-700 rounded-lg text-white focus:outline-none focus:border-purple-400 transition-colors"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-gray-400 text-sm mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 bg-black border border-purple-700 rounded-lg text-white focus:outline-none focus:border-purple-400 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-600 hover:to-purple-800 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-purple-600"
            >
              {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-purple-300 hover:text-white text-sm transition-colors"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 5. MAIN APP COMPONENT (WITH SIGN OUT)

### File: `src/components/ChorApp.tsx`

```typescript
import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function ChorApp() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { signOut } = useAuth();

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.src = '/piano-xl.html';
    }

    // Listen for sign-out message from iframe
    const handleMessage = async (event: MessageEvent) => {
      if (event.data.type === 'SIGN_OUT') {
        console.log('Received SIGN_OUT message from iframe');
        await signOut();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [signOut]);

  return (
    <div className="fixed inset-0 bg-black">
      <iframe
        ref={iframeRef}
        title="Chordinator Piano"
        className="w-full h-full border-none"
        style={{ border: 'none' }}
      />
    </div>
  );
}
```

**CRITICAL:** The sign-out functionality works via postMessage. Inside `piano-xl.html`, you need a SIGN OUT button that posts this message:

```javascript
// Inside piano-xl.html, add a button with this click handler:
signOutButton.addEventListener('click', function() {
  window.parent.postMessage({ type: 'SIGN_OUT' }, '*');
});
```

---

## 6. LANDING PAGE COMPONENT

### File: `src/components/LandingPage.tsx`

```typescript
type LandingPageProps = {
  onSignIn: () => void;
  onSignUp: () => void;
};

export default function LandingPage({ onSignIn, onSignUp }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-black">
      <nav className="border-b border-[#333] bg-black/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img src="/490001 copy.png" alt="Elephant" className="w-8 h-8" />
              <span className="text-xl font-bold text-white">CHORD-INATOR • PIANO XL</span>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={onSignIn}
                className="text-[#aaa] hover:text-white transition-colors px-4 py-2"
              >
                Sign In
              </button>
              <button
                onClick={onSignUp}
                className="bg-[#371d0b] hover:bg-[#4a2710] text-white px-6 py-2 rounded-lg transition-all font-medium shadow-[0_0_12px_rgba(55,29,11,0.6)]"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-3">
              Master Chord Progressions
            </h1>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-[#ccc]">with the</span>
              <br />
              <span className="text-[#ff8c00]">CHORD-INATOR</span>
            </h2>
            <p className="text-xl text-[#ccc] mb-8 max-w-2xl mx-auto">
              The ultimate tool to create sophisticated chord progressions
              <br />
              with the press of a finger
            </p>
            <button
              onClick={onSignUp}
              className="bg-[#371d0b] hover:bg-[#4a2710] text-white px-8 py-4 rounded-lg text-lg font-medium transition-all shadow-[0_0_24px_rgba(55,29,11,0.6)] hover:shadow-[0_0_32px_rgba(55,29,11,0.8)]"
            >
              Get Started
            </button>
          </div>

          <div className="text-center mb-20">
            <div className="text-6xl font-bold text-white mb-2">$3.99</div>
            <div className="text-2xl text-[#aaa]">/month</div>
          </div>

          <div className="bg-[#1a1a1a] rounded-2xl p-12 border border-[#333] text-center shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
            <h2 className="text-3xl font-bold text-white mb-4">Unleash your Genius !</h2>
            <p className="text-[#ccc] mb-8 text-lg">
              Join musicians worldwide using CHORD-INATOR to create amazing music
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onSignUp}
                className="bg-[#371d0b] hover:bg-[#4a2710] text-white px-8 py-3 rounded-lg font-medium transition-all shadow-[0_0_12px_rgba(55,29,11,0.6)] hover:shadow-[0_0_24px_rgba(55,29,11,0.8)]"
              >
                Subscribe Now
              </button>
              <button
                onClick={onSignIn}
                className="bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white px-8 py-3 rounded-lg font-medium transition-colors border border-[#555]"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#333] bg-black/90 backdrop-blur-sm py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[#888]">
          <p>&copy; 2025 Genius Peace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
```

---

## 7. ROOT APP COMPONENT

### File: `src/App.tsx`

```typescript
import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { ChorApp } from './components/ChorApp';
import LandingPage from './components/LandingPage';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return <ChorApp />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
```

---

## 8. PIANO HTML FILE - SIGN OUT BUTTON

Inside `/public/piano-xl.html`, add a SIGN OUT button. Here's the critical code:

### HTML (add to your UI):
```html
<button id="sign-out-btn" style="position: fixed; top: 10px; right: 10px; z-index: 10000;
  padding: 8px 16px; background: #f44336; color: white; border: none;
  border-radius: 4px; cursor: pointer;">
  SIGN OUT
</button>
```

### JavaScript (add to your script):
```javascript
const signOutBtn = document.getElementById('sign-out-btn');
if (signOutBtn) {
  signOutBtn.addEventListener('click', function() {
    console.log('Signing out...');
    window.parent.postMessage({ type: 'SIGN_OUT' }, '*');
  });
}
```

---

## 9. PACKAGE.JSON DEPENDENCIES

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.57.4",
    "lucide-react": "^0.344.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.18",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.5.3",
    "vite": "^5.4.2"
  }
}
```

---

## 11. NEXT STEPS FOR PAYMENTS

**Stripe Integration Requirements:**
1. Create Stripe account at https://dashboard.stripe.com/register
2. Get your Stripe Secret Key from https://dashboard.stripe.com/apikeys
3. Set up Stripe products for $3.99/month subscription
4. Create Supabase Edge Function for webhook handling
5. Add subscription table to database
6. Implement subscription check in RLS policies
7. Add Stripe Checkout button to landing page

**Database Schema for Subscriptions:**
```sql
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  status text,
  price_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

---

## 12. TROUBLESHOOTING

**Common Issues:**

1. **Images not loading:** Ensure actual image files exist in `/public/` directory
2. **Sign out not working:** Check postMessage listener in ChorApp.tsx
3. **Auth not persisting:** Check Supabase environment variables
4. **Database errors:** Verify migrations were applied in correct order
5. **RLS blocking access:** Check that user is authenticated and policies match auth.uid()

**Debug Commands:**
```bash
# Check if images exist
ls -la public/*.jpg

# Verify file types
file public/27.jpg

# Build and check for errors
npm run build

# Check Supabase connection
# (add console.logs in supabase.ts)
```

---

## SUMMARY

This app has:
- ✅ Full authentication system (sign up, sign in, sign out)
- ✅ User profiles with RLS
- ✅ Protected routes
- ✅ Piano interface in iframe
- ⚠️ Payment/subscription system (needs Stripe integration)
