import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type RankingEntry = {
  member_id: string
  name: string
  room_name: string
  total: number
}

export default function Ranking() {
  const navigate = useNavigate()
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRanking() {
      const { data } = await supabase
        .from('attendance')
        .select(`member_id, present, profiles ( name, rooms ( name ) )`)
        .eq('present', true)

      if (!data) return

      const map: Record<string, RankingEntry> = {}
      data.forEach((a: any) => {
        const id = a.member_id
        if (!map[id]) {
          map[id] = {
            member_id: id,
            name: a.profiles?.name ?? 'Desconhecido',
            room_name: a.profiles?.rooms?.name ?? '-',
            total: 0,
          }
        }
        map[id].total += 1
      })

      setRanking(Object.values(map).sort((a, b) => b.total - a.total))
      setLoading(false)
    }
    fetchRanking()
  }, [])

  const medals = ['🥇', '🥈', '🥉']
  const topColors = [
    { bg: '#1a1500', border: '#c9a84c44', nameColor: '#f0d080' },
    { bg: '#141414', border: '#88888833', nameColor: '#ccc' },
    { bg: '#160e00', border: '#cd7f3233', nameColor: '#e8a96a' },
  ]

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
        <p style={{ color: '#fff', fontWeight: 700, fontSize: 18, margin: 0 }}>Ranking</p>
        <p style={{ color: '#c9a84c', fontSize: 11, margin: '2px 0 0', letterSpacing: 1, textTransform: 'uppercase' }}>
          Membros mais presentes
        </p>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading ? (
          <p style={{ color: '#444', textAlign: 'center', marginTop: 40, fontSize: 14 }}>Carregando...</p>
        ) : ranking.length === 0 ? (
          <p style={{ color: '#444', textAlign: 'center', marginTop: 40, fontSize: 14 }}>Nenhuma presença registrada ainda.</p>
        ) : ranking.map((entry, index) => {
          const style = topColors[index] ?? { bg: '#141414', border: '#1e1e1e', nameColor: '#fff' }
          return (
            <div
              key={entry.member_id}
              style={{
                background: style.bg,
                border: `1px solid ${style.border}`,
                borderRadius: 14, padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 14,
              }}
            >
              {/* Posição */}
              <div style={{ width: 28, textAlign: 'center', flexShrink: 0 }}>
                {index < 3 ? (
                  <span style={{ fontSize: 22 }}>{medals[index]}</span>
                ) : (
                  <span style={{ color: '#444', fontWeight: 700, fontSize: 14 }}>#{index + 1}</span>
                )}
              </div>

              {/* Avatar */}
              <div style={{
                width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 16,
                background: index === 0 ? 'linear-gradient(135deg, #c9a84c, #f0d080)' : '#1e1e1e',
                color: index === 0 ? '#000' : '#555',
              }}>
                {entry.name.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <p style={{ color: style.nameColor, fontWeight: 600, fontSize: 15, margin: 0 }}>{entry.name}</p>
                <p style={{ color: '#555', fontSize: 12, margin: '2px 0 0' }}>{entry.room_name}</p>
              </div>

              {/* Total */}
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: index === 0 ? '#c9a84c' : '#fff', fontWeight: 700, fontSize: 20, margin: 0 }}>
                  {entry.total}
                </p>
                <p style={{ color: '#444', fontSize: 11, margin: '2px 0 0' }}>presenças</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}