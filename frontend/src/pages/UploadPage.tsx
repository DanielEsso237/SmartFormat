import { useState } from 'react'

export default function UploadPage({ onBack }: { onBack: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isFormatting, setIsFormatting] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      const url = URL.createObjectURL(selectedFile)
      setPreviewUrl(url)
    }
  }

  const handleFormat = () => {
    if (!file) return
    setIsFormatting(true)
    setTimeout(() => {
      setIsFormatting(false)
      alert("Document formaté avec succès (simulation)")
    }, 2500)
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <nav className="border-b border-zinc-800 py-5">
        <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
          <button 
            onClick={onBack}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            ← Retour
          </button>
          <div className="text-xl font-semibold">SmartFormat</div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-2 gap-12">
          
          {/* Zone d'upload à gauche */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold tracking-tight mb-3">Formatage automatique</h2>
              <p className="text-zinc-400">Votre document sera mis en forme selon les normes de la Faculté des Sciences.</p>
            </div>

            <div className="border border-zinc-800 rounded-3xl p-10 bg-zinc-900">
              <input 
                type="file" 
                accept=".docx,.pdf"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label 
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 hover:border-zinc-500 rounded-2xl py-20 cursor-pointer transition-colors"
              >
                <div className="text-5xl mb-4">📄</div>
                <p className="font-medium text-lg">Cliquez pour sélectionner un fichier</p>
                <p className="text-sm text-zinc-500 mt-1">.docx ou .pdf — Maximum 20 Mo</p>
              </label>
            </div>

            {file && (
              <button 
                onClick={handleFormat}
                disabled={isFormatting}
                className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl font-medium text-lg disabled:opacity-70 transition-all flex items-center justify-center gap-3"
              >
                {isFormatting ? "Formatage en cours..." : "Formater avec IA"}
              </button>
            )}
          </div>

          {/* Aperçu à droite */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 h-[620px] flex flex-col">
            <h3 className="text-lg font-medium mb-6">Aperçu du document</h3>
            <div className="flex-1 border border-dashed border-zinc-700 rounded-2xl flex items-center justify-center overflow-hidden bg-zinc-950">
              {previewUrl ? (
                <iframe 
                  src={previewUrl} 
                  className="w-full h-full"
                  title="Document Preview"
                />
              ) : (
                <div className="text-center text-zinc-500">
                  <p>Aucun document chargé</p>
                  <p className="text-sm mt-2">L'aperçu apparaîtra ici</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}