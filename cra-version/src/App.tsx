import React from 'react';
import { VercelV0Chat } from './components/ui/VercelV0Chat';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-[#020205] relative overflow-hidden flex flex-col items-center pt-12 sm:pt-24 md:pt-32 font-sans">
      {/* Premium Gradient Background Layers -- Optimized for Mobile */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] sm:w-[40%] h-[40%] bg-purple-600/20 blur-[80px] sm:blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] sm:w-[40%] h-[40%] bg-blue-600/20 blur-[80px] sm:blur-[120px] rounded-full" />
      <div className="absolute top-[20%] right-[10%] w-[35%] h-[35%] bg-pink-600/10 blur-[60px] sm:blur-[100px] rounded-full" />

      <div className="relative z-10 w-full max-w-7xl px-0 sm:px-4">
        <VercelV0Chat />
      </div>
    </div>
  );
}

export default App;
