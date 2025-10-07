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
