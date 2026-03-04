import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type Room = {
  id: string
  name: string
  type: string
}

const roomConfig: Record<string, { icon: string; label: string }> = {
  children:  { icon: '🧒', label: 'Infantil' },
  teenagers: { icon: '🧑', label: 'Adolescentes' },
  youth:     { icon: '👦', label: 'Jovens' },
  adults:    { icon: '👨', label: 'Adultos' },
}

export default function Rooms() {
  const navigate = useNavigate()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRooms() {
      const { data } = await supabase.from('rooms').select('*')
      if (data) setRooms(data)
      setLoading(false)
    }
    fetchRooms()
  }, [])

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{
        background: '#111',
        borderBottom: '1px solid #1e1e1e',
        padding: '20px 20px 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #c9a84c, #f0d080)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, flexShrink: 0,
          }}>✝</div>
          <div>
            <p style={{ color: '#fff', fontWeight: 600, fontSize: 16, margin: 0 }}>Nazareno União</p>
            <p style={{ color: '#c9a84c', fontSize: 11, margin: 0, letterSpacing: 1 }}>SALAS DE AULA</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px' }}>

        {loading ? (
          <p style={{ color: '#444', textAlign: 'center', marginTop: 40, fontSize: 14 }}>Carregando...</p>
        ) : (
          <>
            <p style={{ color: '#555', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
              Selecione uma sala
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {rooms.map(room => {
                const config = roomConfig[room.type] ?? { icon: '📚', label: room.type }
                return (
                  <div
                    key={room.id}
                    style={{
                      background: '#141414',
                      border: '1px solid #1e1e1e',
                      borderRadius: 16,
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                    }}
                  >
                    {/* Ícone */}
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: '#1a1a0f',
                      border: '1px solid #2a2a18',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22, flexShrink: 0,
                    }}>
                      {config.icon}
                    </div>

                    {/* Nome */}
                    <div style={{ flex: 1 }}>
                      <p style={{ color: '#fff', fontWeight: 600, fontSize: 15, margin: 0 }}>{room.name}</p>
                      <p style={{ color: '#555', fontSize: 12, margin: '2px 0 0' }}>{config.label}</p>
                    </div>

                    {/* Botões */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => navigate(`/rooms/${room.id}`)}
                        style={{
                          background: 'linear-gradient(135deg, #c9a84c, #f0d080)',
                          color: '#000', fontWeight: 600,
                          fontSize: 12, border: 'none',
                          borderRadius: 10, padding: '8px 14px',
                          cursor: 'pointer',
                        }}
                      >
                        Chamada
                      </button>
                      <button
                        onClick={() => navigate(`/rooms/${room.id}/media`)}
                        style={{
                          background: '#1a1a0f',
                          color: '#c9a84c', fontWeight: 600,
                          fontSize: 12,
                          border: '1px solid #2a2a18',
                          borderRadius: 10, padding: '8px 14px',
                          cursor: 'pointer',
                        }}
                      >
                        Mídia
                      </button>
                    </div>
                  </div>
                )
              })}

              {/* Ranking */}
              <button
                onClick={() => navigate('/ranking')}
                style={{
                  background: '#141414',
                  border: '1px solid #c9a84c33',
                  borderRadius: 16,
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  cursor: 'pointer',
                  width: '100%',
                  marginTop: 4,
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: '#1a1a0f',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, flexShrink: 0,
                }}>
                  🏆
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <p style={{ color: '#c9a84c', fontWeight: 600, fontSize: 15, margin: 0 }}>Ver Ranking</p>
                  <p style={{ color: '#555', fontSize: 12, margin: '2px 0 0' }}>Membros mais presentes</p>
                </div>
                <span style={{ color: '#c9a84c', fontSize: 18 }}>›</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}