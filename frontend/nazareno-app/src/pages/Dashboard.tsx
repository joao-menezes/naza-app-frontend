import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../styles/dashboard.css'

type Stats = {
  totalMembers: number
  totalRooms: number
  presencasHoje: number
  mediaFrequencia: number
  topMember: { name: string; total: number } | null
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const today = new Date().toISOString().split('T')[0]

      const [
        { count: totalMembers },
        { count: totalRooms },
        { data: sessionsHoje },
        { data: allAttendance },
        { data: allSessions },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('rooms').select('*', { count: 'exact', head: true }),
        supabase.from('sessions').select('id').eq('date', today),
        supabase.from('attendance').select('member_id, present, profiles(name)').eq('present', true),
        supabase.from('sessions').select('id'),
      ])

      // Presenças hoje
      let presencasHoje = 0
      if (sessionsHoje && sessionsHoje.length > 0) {
        const sessionIds = sessionsHoje.map((s: any) => s.id)
        const { count } = await supabase
          .from('attendance')
          .select('*', { count: 'exact', head: true })
          .in('session_id', sessionIds)
          .eq('present', true)
        presencasHoje = count ?? 0
      }

      // Média de frequência
      const totalPresencas = allAttendance?.length ?? 0
      const totalSessions = allSessions?.length ?? 1
      const mediaFrequencia = totalMembers
        ? Math.round((totalPresencas / (totalSessions * (totalMembers ?? 1))) * 100)
        : 0

      // Top membro
      const map: Record<string, { name: string; total: number }> = {}
      allAttendance?.forEach((a: any) => {
        const id = a.member_id
        if (!map[id]) map[id] = { name: a.profiles?.name ?? '-', total: 0 }
        map[id].total += 1
      })
      const topMember = Object.values(map).sort((a, b) => b.total - a.total)[0] ?? null

      setStats({
        totalMembers: totalMembers ?? 0,
        totalRooms: totalRooms ?? 0,
        presencasHoje,
        mediaFrequencia,
        topMember,
      })

      setLoading(false)
    }

    fetchStats()
  }, [])

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <div className="dashboard-page">

      <div className="dashboard-header">
        <button className="dashboard-back" onClick={() => navigate('/rooms')}>
          ← Voltar
        </button>

        <div className="dashboard-header-center">
          <div className="dashboard-logo">
            <img src="/icon-192.png" width={36} alt="logo" />
          </div>
          <div>
            <p className="dashboard-title">Dashboard</p>
            <p className="dashboard-sub">VISÃO GERAL</p>
          </div>
        </div>

        <div className="dashboard-header-right" />
      </div>

      <div className="dashboard-content">
        <p className="dashboard-date">{today}</p>

        {loading ? (
          <p className="dashboard-loading">Carregando...</p>
        ) : stats && (
          <>
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <div className="dashboard-card-icon">👥</div>
                <p className="dashboard-card-value">{stats.totalMembers}</p>
                <p className="dashboard-card-label">Total de membros</p>
              </div>

              <div className="dashboard-card">
                <div className="dashboard-card-icon">🏫</div>
                <p className="dashboard-card-value">{stats.totalRooms}</p>
                <p className="dashboard-card-label">Salas ativas</p>
              </div>

              <div className="dashboard-card-gold">
                <div className="dashboard-card-icon">✅</div>
                <p className="dashboard-card-value-gold">{stats.presencasHoje}</p>
                <p className="dashboard-card-label">Presenças hoje</p>
              </div>

              <div className="dashboard-card-gold">
                <div className="dashboard-card-icon">📊</div>
                <p className="dashboard-card-value-gold">{stats.mediaFrequencia}%</p>
                <p className="dashboard-card-label">Média de frequência</p>
              </div>
            </div>

            {stats.topMember && (
              <>
                <p className="dashboard-section-label">🏆 membro mais presente</p>
                <div className="dashboard-top-card">
                  <div className="dashboard-top-avatar">
                    {stats.topMember.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="dashboard-top-name">{stats.topMember.name}</p>
                    <p className="dashboard-top-sub">{stats.topMember.total} presenças registradas</p>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}