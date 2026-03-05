import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { exportRelatorio } from '../lib/exportPDF'

import '../styles/rooms.css'

type Room = {
  id: string
  name: string
  type: string
}

type AppUser = {
  id: string
  name: string
  role: string
  room_id: string | null
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
  const [appUser, setAppUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: userData } = await supabase
          .from('app_users')
          .select('*')
          .eq('id', user.id)
          .single()

        if (userData) setAppUser(userData)
      }

      const { data: roomsData } = await supabase.from('rooms').select('*')
      if (roomsData) setRooms(roomsData)

      setLoading(false)
    }

    fetchData()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }
  

  const visibleRooms = appUser?.role === 'teacher'
    ? rooms.filter(r => r.id === appUser.room_id)
    : rooms

  return (
    <div className="rooms-page">
      <div className="rooms-header">
        <div className="rooms-header-inner">
          <div className="rooms-header-logo">
            <img src="/icon-192.png" width={26} alt="logo" />
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <p className="rooms-header-title">Nazareno União</p>
            <p className="rooms-header-sub">SALAS DE AULA</p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className='rooms-header-sub' style={{ fontSize: 13, fontWeight: 500 }}>
              {appUser?.name ?? '...'}
            </span>
            <button
              onClick={handleLogout}
              className='btn-secondary'
            >
              Sair
            </button>
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
              {visibleRooms.map(room => {
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
              <div className="adm-area">
                {appUser?.role === 'admin' && (
                  <>
                    <button className="admin-btn" onClick={() => navigate('/manage-members')}>
                      <div className="admin-btn-icon">⚙️</div>
                      <div className="ranking-info">
                        <p className="admin-btn-title">Gerenciar Membros</p>
                        <p className="admin-btn-sub">Adicionar e editar membros</p>
                      </div>
                      <span className="admin-btn-arrow">›</span>
                    </button>

                    <button className="admin-btn" onClick={() => navigate('/manage-teachers')}>
                      <div className="admin-btn-icon">👨‍🏫</div>
                      <div className="ranking-info">
                        <p className="admin-btn-title">Gerenciar Professores</p>
                        <p className="admin-btn-sub">Vincular professores às salas</p>
                      </div>
                      <span className="admin-btn-arrow">›</span>
                    </button>

                    <button className="admin-btn" onClick={exportRelatorio}>
                      <div className="admin-btn-icon">📄</div>
                      <div className="ranking-info">
                        <p className="admin-btn-title">Exportar Relatório</p>
                        <p className="admin-btn-sub">Baixar PDF com todos os dados</p>
                      </div>
                      <span className="admin-btn-arrow">›</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}