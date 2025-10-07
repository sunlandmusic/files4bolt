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
