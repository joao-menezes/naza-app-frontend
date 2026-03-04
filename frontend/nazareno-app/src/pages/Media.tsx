import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

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
        supabase.from('sessions').select('*').eq('room_id', roomId).eq('date', today).single(),
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

    const { error: uploadError } = await supabase.storage.from('media').upload(path, file)
    if (uploadError) { alert('Erro ao fazer upload'); setUploading(false); return }

    const { data: urlData } = supabase.storage.from('media').getPublicUrl(path)
    const fileType = file.type.startsWith('image') ? 'image' : file.type === 'application/pdf' ? 'pdf' : 'video'

    const { data: newMedia } = await supabase
      .from('media')
      .insert({ session_id: sessionId, title: file.name, url: urlData.publicUrl, type: fileType })
      .select().single()

    if (newMedia) setMedia(prev => [...prev, newMedia])
    setUploading(false)
  }

  const fileConfig: Record<string, { icon: string; color: string }> = {
    pdf:   { icon: '📄', color: '#e05555' },
    image: { icon: '🖼️', color: '#5599e0' },
    video: { icon: '🎥', color: '#9055e0' },
  }

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ background: '#111', borderBottom: '1px solid #1e1e1e', padding: '20px 20px 16px' }}>
        <button
          onClick={() => navigate('/rooms')}
          style={{ background: 'none', border: 'none', color: '#c9a84c', fontSize: 14, cursor: 'pointer', padding: 0, marginBottom: 12 }}
        >
          ← Voltar
        </button>
        <p style={{ color: '#fff', fontWeight: 700, fontSize: 18, margin: 0 }}>Mídia</p>
        <p style={{ color: '#c9a84c', fontSize: 11, margin: '2px 0 0', letterSpacing: 1, textTransform: 'uppercase' }}>
          {room?.name} — aula de hoje
        </p>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Upload */}
        <label style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          background: '#141414',
          border: uploading ? '1px dashed #2a2a2a' : '1px dashed #c9a84c66',
          borderRadius: 14, padding: '18px 16px',
          cursor: uploading ? 'not-allowed' : 'pointer',
          color: uploading ? '#444' : '#c9a84c',
        }}>
          <span style={{ fontSize: 20 }}>{uploading ? '⏳' : '+'}</span>
          <span style={{ fontWeight: 600, fontSize: 14 }}>
            {uploading ? 'Enviando...' : 'Adicionar mídia'}
          </span>
          <input
            type="file"
            accept="image/*,application/pdf,video/*"
            style={{ display: 'none' }}
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>

        {loading ? (
          <p style={{ color: '#444', textAlign: 'center', marginTop: 40, fontSize: 14 }}>Carregando...</p>
        ) : !sessionId ? (
          <p style={{ color: '#444', textAlign: 'center', marginTop: 40, fontSize: 14 }}>Nenhuma aula hoje.</p>
        ) : media.length === 0 ? (
          <p style={{ color: '#555', textAlign: 'center', marginTop: 24, fontSize: 14 }}>Nenhuma mídia adicionada ainda.</p>
        ) : media.map(item => {
          const config = fileConfig[item.type] ?? { icon: '📎', color: '#888' }
          return (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#141414', border: '1px solid #1e1e1e',
                borderRadius: 14, padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 14,
                textDecoration: 'none',
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: `${config.color}18`,
                border: `1px solid ${config.color}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22,
              }}>
                {config.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: '#fff', fontWeight: 600, fontSize: 14, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.title}
                </p>
                <p style={{ color: '#555', fontSize: 12, margin: '2px 0 0', textTransform: 'capitalize' }}>{item.type}</p>
              </div>
              <span style={{ color: '#c9a84c', fontSize: 16 }}>↗</span>
            </a>
          )
        })}
      </div>
    </div>
  )
}