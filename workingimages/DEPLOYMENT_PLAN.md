# Piano XL (Chordinator) - Deployment Plan for geniuspeace.com

## Current Status ✅

Your Piano XL app has been successfully integrated into a Vite/React project and is ready for testing.

### What's Working
- Piano XL app embedded via iframe
- All original functionality preserved (keyboard, chords, skins, modes, sequencer)
- Build system configured
- Ready for local testing

## Testing Instructions

The dev server is running automatically. You can now test:

1. **Piano Keyboard**: Click keys to play notes
2. **Chord System**: Test chord playing functionality
3. **Skin Cycling**: Click "PIANO" text to cycle backgrounds
4. **Mode Selection**: Test different musical scales
5. **Step Sequencer**: Verify sequencer controls work
6. **Background Clear**: Long-press camera button to clear skins

## Next Steps

### Phase 1: User Authentication (Ready to implement after testing)
- Set up Supabase email/password authentication
- Create login/signup forms
- Add protected routes
- Implement session management

### Phase 2: Subscription System
- Integrate Stripe for payments
- Create subscription tiers (free vs paid)
- Add billing management
- Implement feature gating

### Phase 3: Domain Deployment (geniuspeace.com)
- Configure DNS settings
- Deploy to production hosting
- Set up SSL certificate
- Configure custom domain

## Technical Details

**Current Structure:**
- `/piano-xl.html` - Original Piano XL app (423KB)
- `/public/*.png` - Background images (20-30.png)
- `src/App.tsx` - React wrapper with iframe integration

**Dependencies:**
- Tone.js (loaded via CDN in piano-xl.html)
- Supabase (configured, ready for auth)
- React + Vite

## Important Notes

- The app is currently embedded in an iframe to preserve all original functionality
- All 11 background images are included (20.png through 30.png)
- Supabase database is already provisioned and ready to use
- After authentication is added, we can implement feature restrictions and subscription tiers
