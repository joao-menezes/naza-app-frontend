import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type MediaItem = {
  id: string
  title: string
  url: string
  type: string
}

type Room = {
  id: string
  name: string
}

export default function Media() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const [room, setRoom] = useState<Room | null>(null)
  const [media, setMedia] = useState<MediaItem[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const today = new Date().toISOString().split('T')[0]

      const [{ data: roomData }, { data: sessionData }] = await Promise.all([
        supabase.from('rooms').select('*').eq('id', roomId).single(),
        supabase.from('sessions').select('*').eq('room_id', roomId).eq('date', today).single(),
      ])

      if (roomData) setRoom(roomData)

      if (sessionData) {
        setSessionId(sessionData.id)

        const { data: mediaData } = await supabase
          .from('media')
          .select('*')
          .eq('session_id', sessionData.id)

        if (mediaData) setMedia(mediaData)
      }

      setLoading(false)
    }

    fetchData()
  }, [roomId])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !sessionId) return

    setUploading(true)

    const ext = file.name.split('.').pop()
    const path = `${sessionId}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(path, file)

    if (uploadError) {
      alert('Erro ao fazer upload')
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage.from('media').getPublicUrl(path)

    const fileType = file.type.startsWith('image')
      ? 'image'
      : file.type === 'application/pdf'
      ? 'pdf'
      : 'video'

    const { data: newMedia } = await supabase
      .from('media')
      .insert({
        session_id: sessionId,
        title: file.name,
        url: urlData.publicUrl,
        type: fileType,
      })
      .select()
      .single()

    if (newMedia) setMedia(prev => [...prev, newMedia])
    setUploading(false)
  }

  const fileIcons: Record<string, string> = {
    pdf: '📄',
    image: '🖼️',
    video: '🎥',
  }

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="max-w-md mx-auto">

        <button
          onClick={() => navigate('/rooms')}
          className="text-gray-400 text-sm mb-6 flex items-center gap-2 hover:text-white transition"
        >
          {'<-'} Voltar
        </button>

        <div className="mb-6">
          <h1 className="text-white text-2xl font-semibold">Media</h1>
          <p className="text-gray-400 text-sm mt-1">{room?.name} — aula de hoje</p>
        </div>

        <label
          className={`w-full mb-6 flex items-center justify-center gap-3 rounded-2xl px-6 py-4 border-2 border-dashed transition cursor-pointer ${
            uploading
              ? 'border-gray-700 text-gray-600'
              : 'border-indigo-500/50 hover:border-indigo-500 text-indigo-400 hover:text-indigo-300'
          }`}
        >
          <span className="text-xl">{uploading ? '...' : '+'}</span>
          <span className="font-medium text-sm">
            {uploading ? 'Enviando...' : 'Adicionar midia'}
          </span>
          <input
            type="file"
            accept="image/*,application/pdf,video/*"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>

        {loading ? (
          <p className="text-gray-400 text-center">Carregando...</p>
        ) : !sessionId ? (
          <p className="text-gray-400 text-center">Nenhuma aula hoje.</p>
        ) : media.length === 0 ? (
          <p className="text-gray-400 text-center">Nenhuma midia adicionada ainda.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {media.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-900 hover:bg-gray-800 rounded-2xl px-6 py-4 flex items-center gap-4 transition"
              >
                <span className="text-2xl">{fileIcons[item.type] ?? '📎'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{item.title}</p>
                  <p className="text-gray-400 text-sm capitalize">{item.type}</p>
                </div>
                <span className="text-gray-600 text-sm">open</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}