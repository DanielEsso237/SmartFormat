import { useState } from 'react'

export default function LandingPage({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-zinc-800 py-6">
        <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
          <div className="text-2xl font-semibold tracking-tight">SmartFormat</div>
          <button 
            onClick={onStart}
            className="px-8 py-3 bg-white text-black font-medium rounded-xl hover:bg-zinc-200 transition-colors"
          >
            Commencer
          </button>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-4xl mx-auto text-center px-8">
          <h1 className="text-7xl font-bold tracking-tighter mb-6 bg-gradient-to-r from-white via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
            Mise en forme automatique<br />selon la charte facultaire
          </h1>
          <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto">
            Téléchargez vos documents et obtenez une version parfaitement conforme 
            à la charte de la Faculté des Sciences en quelques secondes.
          </p>
          <button 
            onClick={onStart}
            className="px-12 py-5 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl font-medium hover:brightness-110 transition-all"
          >
            Formater mon document
          </button>
        </div>
      </main>
    </div>
  )
}