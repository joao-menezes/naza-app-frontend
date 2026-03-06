import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../styles/members.css'

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

      const [{ data: roomData }, { data: membersData }, { data: sessionData }] = await Promise.all([
        supabase.from('rooms').select('*').eq('id', roomId).single(),
        supabase.from('profiles').select('*').eq('room_id', roomId),
        supabase.from('sessions').select('*').eq('room_id', roomId).eq('date', today).maybeSingle(),
      ])

      if (roomData) setRoom(roomData)
      if (membersData) setMembers(membersData)

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

  function getNextSunday() {
    const date = new Date();
    const currentDay = date.getDay();
    const daysUntilNextSunday = currentDay === 0 ? 7 : (7 - currentDay);
    date.setDate(date.getDate() + daysUntilNextSunday);
    return date;
  }

  const nextSunday = getNextSunday();
  const formattedDate = nextSunday.toLocaleDateString('pt-BR');

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
  <div className="members-page">
    <div className="members-header">
      <button
        onClick={() => navigate('/rooms')}
        className="members-back-button"
      >
        ← Voltar
      </button>

      <p className="members-room-title">{room?.name}</p>
      <p className="members-room-subtitle">Chamada de hoje</p>
    </div>

  {!sessionId && !loading && (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <p style={{ color: '#fff', fontWeight: 600, fontSize: 16, margin: '0 0 6px' }}>
        Sem aula hoje
      </p>
      <p style={{ color: '#555', fontSize: 13 }}>
        A chamada será liberada automaticamente no próximo domingo - <span style={{color: '#c9a84c'}}>{formattedDate}</span>
      </p>
    </div>
  )}

  {sessionId && members.map(() => (
    <>
      <div className="members-progress-wrapper">
        <div className="members-progress-card">
          <div className="members-progress-info">
            <div className="members-progress-header">
              <span className="members-progress-label">Presença</span>
              <span className="members-progress-count">
                {presentCount} / {members.length}
              </span>
            </div>

            <div className="members-progress-bar-bg">
              <div
                className="members-progress-bar-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <p className="members-progress-percent">
            {Math.round(progress)}%
          </p>
        </div>
      </div>
      <div className="members-list">
        {loading ? (
          <p className="members-empty">Carregando...</p>
        ) : members.length === 0 ? (
          <p className="members-empty">
            Nenhum membro nessa sala.
          </p>
        ) : (
          members.map(member => {
            const present = attendance[member.id] ?? false
            const isSaving = saving === member.id

            return (
              <button
                key={member.id}
                onClick={() => toggleAttendance(member.id)}
                disabled={isSaving}
                className={`member-card ${
                  present ? 'member-present' : 'member-absent'
                }`}
              >
                <div
                  className={`member-avatar ${
                    present ? 'avatar-present' : 'avatar-absent'
                  }`}
                >
                  {member.name.charAt(0).toUpperCase()}
                </div>

                <div className="member-info">
                  <p
                    className={`member-name ${
                      present
                        ? 'member-name-present'
                        : 'member-name-absent'
                    }`}
                  >
                    {member.name}
                  </p>

                  <p
                    className={`member-status ${
                      present
                        ? 'status-present'
                        : 'status-absent'
                    }`}
                  >
                    {present ? 'Presente' : 'Ausente'}
                  </p>
                </div>

                <div
                  className={`member-status-icon ${
                    present
                      ? 'status-icon-present'
                      : 'status-icon-absent'
                  }`}
                >
                  {isSaving ? '⏳' : present ? '✓' : '○'}
                </div>
              </button>
            )
          })
        )}
      </div>
      </>
    ))}
  </div>
)
}