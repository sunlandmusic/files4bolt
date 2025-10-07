import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

interface AuthPageProps {
  onSuccess?: () => void;
}

export function AuthPage({ onSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);

  return isLogin ? (
    <LoginForm 
      onSuccess={onSuccess}
      onSwitchToSignup={() => setIsLogin(false)}
    />
  ) : (
    <SignupForm 
      onSuccess={onSuccess}
      onSwitchToLogin={() => setIsLogin(true)}
    />
  );
}