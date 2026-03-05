import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../styles/media.css'

type MediaItem = { id: string; title: string; url: string; type: string }
type Room = { id: string; name: string }

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
        supabase.from('sessions').select('*').eq('room_id', roomId).eq('date', today).maybeSingle(),
      ])

      if (roomData) setRoom(roomData)

      if (sessionData) {
        setSessionId(sessionData.id)
        const { data: mediaData } = await supabase
          .from('media').select('*').eq('session_id', sessionData.id)
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

    const { error: uploadError } =
      await supabase.storage.from('media').upload(path, file)

    if (uploadError) {
      alert('Erro ao fazer upload')
      setUploading(false)
      return
    }

    const { data: urlData } =
      supabase.storage.from('media').getPublicUrl(path)

    const fileType =
      file.type.startsWith('image')
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

    if (newMedia) {
      setMedia(prev => [...prev, newMedia])
    }

    setUploading(false)
  }

  const fileConfig: Record<string, { icon: string; color: string }> = {
    pdf:   { icon: '📄', color: '#e05555' },
    image: { icon: '🖼️', color: '#5599e0' },
    video: { icon: '🎥', color: '#9055e0' },
  }

  return (
    <div className="mediaPage">

      {/* Header */}
      <div className="mediaHeader">
        <button
          className="backButton"
          onClick={() => navigate('/rooms')}
        >
          ← Voltar
        </button>

        <p className="mediaTitle">Mídia</p>

        <p className="mediaSubtitle">
          {room?.name} — aula de hoje
        </p>
      </div>

      <div className="mediaContent">

        {/* Upload */}
        <label
          className={`uploadLabel ${
            uploading ? 'uploadDisabled' : 'uploadActive'
          }`}
        >
          <span className="uploadIcon">
            {uploading ? '⏳' : '+'}
          </span>

          <span className="uploadText">
            {uploading ? 'Enviando...' : 'Adicionar mídia'}
          </span>

          <input
            type="file"
            accept="image/*,application/pdf,video/*"
            className="hiddenInput"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>

        {loading ? (
          <p className="stateMessage">
            Carregando...
          </p>
        ) : !sessionId ? (
          <p className="stateMessage">
            Nenhuma aula hoje.
          </p>
        ) : media.length === 0 ? (
          <p className="stateMessageAlt">
            Nenhuma mídia adicionada ainda.
          </p>
        ) : (
          media.map(item => {
            const config =
              fileConfig[item.type] ?? { icon: '📎', color: '#888' }

            return (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mediaItem"
              >
                <div
                  className="mediaIconBox"
                  style={{
                    background: `${config.color}18`,
                    border: `1px solid ${config.color}33`,
                  }}
                >
                  {config.icon}
                </div>

                <div className="mediaInfo">
                  <p className="mediaTitleText">
                    {item.title}
                  </p>

                  <p className="mediaType">
                    {item.type}
                  </p>
                </div>

                <span className="mediaArrow">
                  ↗
                </span>
              </a>
            )
          })
        )}
      </div>
    </div>
  )
}