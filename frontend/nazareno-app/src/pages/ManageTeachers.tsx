import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../styles/manageteachers.css'

type Room = { id: string; name: string }
type Teacher = { id: string; name: string; email: string; room_id: string; rooms?: { name: string } }

export default function ManageTeachers() {
  const navigate = useNavigate()
  const [rooms, setRooms] = useState<Room[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [uuid, setUuid] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [roomId, setRoomId] = useState('')

  useEffect(() => {
    async function fetchData() {
      const [{ data: roomsData }, { data: teachersData }] = await Promise.all([
        supabase.from('rooms').select('*'),
        supabase.from('app_users').select('*, rooms(name)').eq('role', 'teacher'),
      ])

      if (roomsData) {
        setRooms(roomsData)
        setRoomId(roomsData[0]?.id ?? '')
      }
      if (teachersData) setTeachers(teachersData)
      setLoading(false)
    }

    fetchData()
  }, [])

  async function handleAdd() {
    if (!uuid.trim() || !name.trim() || !email.trim() || !roomId) return
    setSaving(true)

    const { data, error } = await supabase
      .from('app_users')
      .insert({ id: uuid.trim(), name: name.trim(), email: email.trim(), role: 'teacher', room_id: roomId })
      .select('*, rooms(name)')
      .single()

    if (error) {
      alert('Erro ao adicionar teacher. Verifique se o UUID está correto.')
    } else if (data) {
      setTeachers(prev => [...prev, data])
      setUuid('')
      setName('')
      setEmail('')
    }

    setSaving(false)
  }

  async function handleDelete(id: string) {
    const confirm = window.confirm('Remover este professor?')
    if (!confirm) return

    await supabase.from('app_users').delete().eq('id', id)
    setTeachers(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div className="teachers-page">

      <div className="teachers-header">
        <button className="teachers-back" onClick={() => navigate('/rooms')}>
          ← Voltar
        </button>
        <p className="teachers-header-title">Gerenciar Professores</p>
        <p className="teachers-header-sub">Vincular professores às salas</p>
      </div>

      <div className="teachers-content">

        <div className="teachers-form">
          <p className="teachers-form-title">Novo professor</p>

          <div className="teachers-form-tip">
            💡 Crie o login do professor em <strong>Supabase → Authentication → Add User</strong>, copie o UUID gerado e cole abaixo.
          </div>

          <div className="form-field" style={{ marginBottom: 14 }}>
            <span className="form-label" style={{ color: '#c9a84c', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 8, display: 'block' }}>
              UUID do usuário
            </span>
            <input
              type="text"
              placeholder="Cole o UUID aqui"
              value={uuid}
              onChange={e => setUuid(e.target.value)}
              style={{
                width: '100%', boxSizing: 'border-box' as const,
                background: '#0a0a0a', border: '1px solid #2a2a2a',
                borderRadius: 12, padding: '12px 16px',
                color: '#fff', fontSize: 14, outline: 'none',
              }}
            />
          </div>

          <div className="form-field" style={{ marginBottom: 14 }}>
            <span className="form-label" style={{ color: '#c9a84c', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 8, display: 'block' }}>
              Nome
            </span>
            <input
              type="text"
              placeholder="Nome do professor"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                width: '100%', boxSizing: 'border-box' as const,
                background: '#0a0a0a', border: '1px solid #2a2a2a',
                borderRadius: 12, padding: '12px 16px',
                color: '#fff', fontSize: 14, outline: 'none',
              }}
            />
          </div>

          <div className="form-field" style={{ marginBottom: 14 }}>
            <span className="form-label" style={{ color: '#c9a84c', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 8, display: 'block' }}>
              Email
            </span>
            <input
              type="email"
              placeholder="email@professor.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                width: '100%', boxSizing: 'border-box' as const,
                background: '#0a0a0a', border: '1px solid #2a2a2a',
                borderRadius: 12, padding: '12px 16px',
                color: '#fff', fontSize: 14, outline: 'none',
              }}
            />
          </div>

          <div className="form-field" style={{ marginBottom: 16 }}>
            <span className="form-label" style={{ color: '#c9a84c', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 8, display: 'block' }}>
              Sala
            </span>
            <select
              value={roomId}
              onChange={e => setRoomId(e.target.value)}
              style={{
                width: '100%', boxSizing: 'border-box' as const,
                background: '#0a0a0a', border: '1px solid #2a2a2a',
                borderRadius: 12, padding: '12px 16px',
                color: '#fff', fontSize: 14, outline: 'none',
              }}
            >
              {rooms.map(room => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleAdd}
            disabled={saving || !uuid.trim() || !name.trim() || !email.trim()}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #c9a84c, #f0d080)',
              color: '#000', fontWeight: 700,
              fontSize: 14, border: 'none',
              borderRadius: 12, padding: '14px',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Adicionando...' : '+ Adicionar professor'}
          </button>
        </div>

        <p className="teachers-section-label">Professores ({teachers.length})</p>

        {loading ? (
          <p className="teachers-loading">Carregando...</p>
        ) : teachers.length === 0 ? (
          <p className="teachers-empty">Nenhum professor cadastrado ainda.</p>
        ) : (
          <div className="teachers-list">
            {teachers.map(teacher => (
              <div key={teacher.id} className="teacher-card">
                <div className="teacher-avatar">
                  {teacher.name.charAt(0).toUpperCase()}
                </div>
                <div className="teacher-info">
                  <p className="teacher-name">{teacher.name}</p>
                  <p className="teacher-room">{teacher.rooms?.name ?? '—'}</p>
                  <p className="teacher-email">{teacher.email}</p>
                </div>
                <button className="btn-delete-teacher" onClick={() => handleDelete(teacher.id)}>
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}