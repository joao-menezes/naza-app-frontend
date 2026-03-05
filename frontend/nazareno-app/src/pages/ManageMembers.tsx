import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../styles/managemembers.css'

type Room = { id: string; name: string }
type Member = { id: string; name: string; room_id: string; rooms?: { name: string } }

export default function ManageMembers() {
  const navigate = useNavigate()
  const [rooms, setRooms] = useState<Room[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState('')
  const [roomId, setRoomId] = useState('')

  useEffect(() => {
    async function fetchData() {
      const [{ data: roomsData }, { data: membersData }] = await Promise.all([
        supabase.from('rooms').select('*'),
        supabase.from('profiles').select('*, rooms(name)').order('name'),
      ])

      if (roomsData) {
        setRooms(roomsData)
        setRoomId(roomsData[0]?.id ?? '')
      }
      if (membersData) setMembers(membersData)
      setLoading(false)
    }

    fetchData()
  }, [])

  async function handleAdd() {
    if (!name.trim() || !roomId) return
    setSaving(true)

    const { data, error } = await supabase
      .from('profiles')
      .insert({ name: name.trim(), email: '', role: 'member', room_id: roomId })
      .select('*, rooms(name)')
      .single()

    if (!error && data) {
      setMembers(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      setName('')
    }

    setSaving(false)
  }

    async function handleDelete(id: string) {
    const confirm = window.confirm('Remover este membro?')
    if (!confirm) return

    // Primeiro remove as presenças vinculadas
    await supabase.from('attendance').delete().eq('member_id', id)

    // Depois remove o membro
    const { error } = await supabase.from('profiles').delete().eq('id', id)

    if (!error) {
        setMembers(prev => prev.filter(m => m.id !== id))
    }
    }

  return (
    <div className="manage-page">

      <div className="manage-header">
        <button className="manage-back" onClick={() => navigate('/rooms')}>
          ← Voltar
        </button>
        <p className="manage-header-title">Gerenciar Membros</p>
        <p className="manage-header-sub">Adicionar e remover membros</p>
      </div>

      <div className="manage-content">

        {/* Formulário */}
        <div className="manage-form">
          <p className="manage-form-title">Novo membro</p>

          <div className="form-field">
            <span className="form-label">Nome</span>
            <input
              type="text"
              placeholder="Nome completo"
              value={name}
              onChange={e => setName(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-field">
            <span className="form-label">Sala</span>
            <select
              value={roomId}
              onChange={e => setRoomId(e.target.value)}
              className="form-select"
            >
              {rooms.map(room => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </select>
          </div>

          <button
            className="btn-add"
            onClick={handleAdd}
            disabled={saving || !name.trim()}
          >
            {saving ? 'Adicionando...' : '+ Adicionar membro'}
          </button>
        </div>

        {/* Lista */}
        <p className="manage-section-label">Membros cadastrados ({members.length})</p>

        {loading ? (
          <p className="manage-loading">Carregando...</p>
        ) : members.length === 0 ? (
          <p className="manage-empty">Nenhum membro cadastrado ainda.</p>
        ) : (
          <div className="member-list">
            {members.map(member => (
              <div key={member.id} className="member-card">
                <div className="member-avatar">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="member-info">
                  <p className="member-name">{member.name}</p>
                  <p className="member-room">{member.rooms?.name ?? '—'}</p>
                </div>
                <button className="btn-delete" onClick={() => handleDelete(member.id)}>
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