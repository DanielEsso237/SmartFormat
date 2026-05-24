import { useState } from 'react'
import LandingPage from './pages/LandingPage'
import UploadPage from './pages/UploadPage'

function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'upload'>('landing')

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {currentPage === 'landing' ? (
        <LandingPage onStart={() => setCurrentPage('upload')} />
      ) : (
        <UploadPage onBack={() => setCurrentPage('landing')} />
      )}
    </div>
  )
}

export default App