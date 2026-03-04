import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type Member = {
  id: string
  name: string
  email: string
}

type Room = {
  id: string
  name: string
}

type Attendance = {
  member_id: string
  present: boolean
}

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

      // Busca ou cria sessão do dia
      let { data: sessionData } = await supabase
        .from('sessions')
        .select('*')
        .eq('room_id', roomId)
        .eq('date', today)
        .single()

      if (!sessionData) {
        const { data: newSession } = await supabase
          .from('sessions')
          .insert({ room_id: roomId, date: today, title: `Aula ${today}` })
          .select()
          .single()
        sessionData = newSession
      }

      if (sessionData) {
        setSessionId(sessionData.id)

        // Busca presenças já marcadas
        const { data: attendanceData } = await supabase
          .from('attendance')
          .select('*')
          .eq('session_id', sessionData.id)

        const map: Record<string, boolean> = {}
        attendanceData?.forEach(a => { map[a.member_id] = a.present })
        setAttendance(map)
      }

      setLoading(false)
    }

    fetchData()
  }, [roomId])

  async function toggleAttendance(memberId: string) {
    if (!sessionId) return
    setSaving(memberId)

    const current = attendance[memberId] ?? false
    const next = !current

    const { data: existing } = await supabase
      .from('attendance')
      .select('*')
      .eq('session_id', sessionId)
      .eq('member_id', memberId)
      .single()

    if (existing) {
      await supabase
        .from('attendance')
        .update({ present: next })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('attendance')
        .insert({ session_id: sessionId, member_id: memberId, present: next })
    }

    setAttendance(prev => ({ ...prev, [memberId]: next }))
    setSaving(null)
  }

  const presentCount = Object.values(attendance).filter(Boolean).length

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="max-w-md mx-auto">

        <button
          onClick={() => navigate('/rooms')}
          className="text-gray-400 text-sm mb-6 flex items-center gap-2 hover:text-white transition"
        >
          ← Voltar
        </button>

        <div className="mb-6">
          <h1 className="text-white text-2xl font-semibold">{room?.name}</h1>
          <p className="text-gray-400 text-sm mt-1">
            {presentCount} de {members.length} presentes
          </p>
        </div>

        {/* Barra de progresso */}
        <div className="w-full bg-gray-800 rounded-full h-2 mb-6">
          <div
            className="bg-indigo-500 h-2 rounded-full transition-all"
            style={{ width: members.length ? `${(presentCount / members.length) * 100}%` : '0%' }}
          />
        </div>

        {loading ? (
          <p className="text-gray-400 text-center">Carregando...</p>
        ) : members.length === 0 ? (
          <p className="text-gray-400 text-center">Nenhum membro nessa sala.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {members.map(member => {
              const present = attendance[member.id] ?? false
              const isSaving = saving === member.id

              return (
                <button
                  key={member.id}
                  onClick={() => toggleAttendance(member.id)}
                  disabled={isSaving}
                  className={`rounded-2xl px-6 py-4 flex items-center gap-4 transition ${
                    present
                      ? 'bg-indigo-600 hover:bg-indigo-500'
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 ${
                    present ? 'bg-indigo-400' : 'bg-gray-700'
                  }`}>
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium">{member.name}</p>
                    <p className={`text-sm ${present ? 'text-indigo-200' : 'text-gray-400'}`}>
                      {present ? 'Presente' : 'Ausente'}
                    </p>
                  </div>
                  <span className="ml-auto text-xl">
                    {isSaving ? '⏳' : present ? '✅' : '○'}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}