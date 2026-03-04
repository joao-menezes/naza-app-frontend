import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../styles/rooms.css'

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
    <div className="rooms-page">

      <div className="rooms-header">
        <div className="rooms-header-inner">
          <div className="rooms-header-logo">
            <img src="/icon-192.png" width={36} alt="logo" />
          </div>
          <div>
            <p className="rooms-header-title">Nazareno União</p>
            <p className="rooms-header-sub">SALAS DE AULA</p>
          </div>
        </div>
      </div>

      <div className="rooms-content">
        {loading ? (
          <p className="rooms-loading">Carregando...</p>
        ) : (
          <>
            <p className="rooms-section-label">Selecione uma sala</p>

            <div className="rooms-list">
              {rooms.map(room => {
                const config = roomConfig[room.type] ?? { icon: '📚', label: room.type }
                return (
                  <div key={room.id} className="room-card">
                    <div className="room-card-icon">{config.icon}</div>
                    <div className="room-card-info">
                      <p className="room-card-name">{room.name}</p>
                      <p className="room-card-label">{config.label}</p>
                    </div>
                    <div className="room-card-actions">
                      <button className="btn-primary" onClick={() => navigate(`/rooms/${room.id}`)}>
                        Chamada
                      </button>
                      <button className="btn-secondary" onClick={() => navigate(`/rooms/${room.id}/media`)}>
                        Mídia
                      </button>
                    </div>
                  </div>
                )
              })}

              <button className="ranking-btn" onClick={() => navigate('/ranking')}>
                <div className="ranking-icon">🏆</div>
                <div className="ranking-info">
                  <p className="ranking-title">Ver Ranking</p>
                  <p className="ranking-sub">Membros mais presentes</p>
                </div>
                <span className="ranking-arrow">›</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}