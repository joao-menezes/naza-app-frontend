import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type Member = { id: string; name: string; email: string }
type Room = { id: string; name: string }
type AttendanceRow = { member_id: string; present: boolean }

export default function Members() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const [members, setMembers] = useState<Member[]>([])
  const [room, setRoom] = useState<Room | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [attendance, setAttendance] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      const today = new Date().toISOString().split('T')[0]

      const [{ data: roomData }, { data: membersData }] = await Promise.all([
        supabase.from('rooms').select('*').eq('id', roomId).single(),
        supabase.from('profiles').select('*').eq('room_id', roomId),
      ])

      if (roomData) setRoom(roomData)
      if (membersData) setMembers(membersData)

      let { data: sessionData } = await supabase
        .from('sessions').select('*').eq('room_id', roomId).eq('date', today).single()

      if (!sessionData) {
        const { data: newSession } = await supabase
          .from('sessions')
          .insert({ room_id: roomId, date: today, title: `Aula ${today}` })
          .select().single()
        sessionData = newSession
      }

      if (sessionData) {
        setSessionId(sessionData.id)
        const { data: attendanceData } = await supabase
          .from('attendance').select('*').eq('session_id', sessionData.id)
        const map: Record<string, boolean> = {}
        attendanceData?.forEach((a: AttendanceRow) => { map[a.member_id] = a.present })
        setAttendance(map)
      }

      setLoading(false)
    }
    fetchData()
  }, [roomId])

  async function toggleAttendance(memberId: string) {
    if (!sessionId) return
    setSaving(memberId)
    const next = !(attendance[memberId] ?? false)

    const { data: existing } = await supabase
      .from('attendance').select('*').eq('session_id', sessionId).eq('member_id', memberId).single()

    if (existing) {
      await supabase.from('attendance').update({ present: next }).eq('id', existing.id)
    } else {
      await supabase.from('attendance').insert({ session_id: sessionId, member_id: memberId, present: next })
    }

    setAttendance(prev => ({ ...prev, [memberId]: next }))
    setSaving(null)
  }

  const presentCount = Object.values(attendance).filter(Boolean).length
  const progress = members.length ? (presentCount / members.length) * 100 : 0

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
        <p style={{ color: '#fff', fontWeight: 700, fontSize: 18, margin: 0 }}>{room?.name}</p>
        <p style={{ color: '#c9a84c', fontSize: 11, margin: '2px 0 0', letterSpacing: 1, textTransform: 'uppercase' }}>
          Chamada de hoje
        </p>
      </div>

      {/* Progresso */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{
          background: '#141414', border: '1px solid #1e1e1e',
          borderRadius: 14, padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: '#555', fontSize: 12 }}>Presença</span>
              <span style={{ color: '#c9a84c', fontSize: 12, fontWeight: 600 }}>{presentCount} / {members.length}</span>
            </div>
            <div style={{ background: '#1a1a1a', borderRadius: 99, height: 6 }}>
              <div style={{
                height: 6, borderRadius: 99,
                background: 'linear-gradient(90deg, #c9a84c, #f0d080)',
                width: `${progress}%`, transition: 'width 0.3s',
              }} />
            </div>
          </div>
          <p style={{ color: '#c9a84c', fontWeight: 700, fontSize: 20, margin: 0 }}>
            {Math.round(progress)}%
          </p>
        </div>
      </div>

      {/* Lista */}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading ? (
          <p style={{ color: '#444', textAlign: 'center', marginTop: 40, fontSize: 14 }}>Carregando...</p>
        ) : members.length === 0 ? (
          <p style={{ color: '#444', textAlign: 'center', marginTop: 40, fontSize: 14 }}>Nenhum membro nessa sala.</p>
        ) : members.map(member => {
          const present = attendance[member.id] ?? false
          const isSaving = saving === member.id

          return (
            <button
              key={member.id}
              onClick={() => toggleAttendance(member.id)}
              disabled={isSaving}
              style={{
                background: present ? '#1a1a0f' : '#141414',
                border: present ? '1px solid #c9a84c55' : '1px solid #1e1e1e',
                borderRadius: 14, padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 14,
                cursor: 'pointer', width: '100%', transition: 'all 0.15s',
              }}
            >
              <div style={{
                width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 16,
                background: present ? 'linear-gradient(135deg, #c9a84c, #f0d080)' : '#1e1e1e',
                color: present ? '#000' : '#555',
              }}>
                {member.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <p style={{ color: present ? '#fff' : '#888', fontWeight: 600, fontSize: 15, margin: 0 }}>
                  {member.name}
                </p>
                <p style={{ color: present ? '#c9a84c' : '#444', fontSize: 12, margin: '2px 0 0' }}>
                  {present ? 'Presente' : 'Ausente'}
                </p>
              </div>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: present ? 'linear-gradient(135deg, #c9a84c, #f0d080)' : '#1e1e1e',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, color: present ? '#000' : '#444',
                border: present ? 'none' : '1px solid #2a2a2a',
              }}>
                {isSaving ? '⏳' : present ? '✓' : '○'}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}