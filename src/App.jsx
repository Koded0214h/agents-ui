import { VercelV0Chat } from './components/ui/v0-ai-chat'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-[#020205] relative overflow-hidden flex flex-col items-center pt-32">
      {/* Premium Gradient Background Layers */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-pink-600/10 blur-[100px] rounded-full" />

      <div className="relative z-10 w-full px-4">
        <VercelV0Chat />
      </div>
    </div>
  )
}

export default App
