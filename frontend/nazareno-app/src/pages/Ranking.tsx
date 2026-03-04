import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../styles/ranking.css'

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

  return (
    <div className="ranking-page">
      <div className="ranking-header">
        <button
          onClick={() => navigate('/rooms')}
          className="ranking-back-button"
        >
          ← Voltar
        </button>
        <p className="ranking-title">Ranking</p>
        <p className="ranking-subtitle">Membros mais presentes</p>
      </div>

      <div className="ranking-list">
        {loading ? (
          <p className="ranking-empty">Carregando...</p>
        ) : ranking.length === 0 ? (
          <p className="ranking-empty">Nenhuma presença registrada ainda.</p>
        ) : (
          ranking.map((entry, index) => {
            const medalClass =
              index === 0 ? 'gold' :
              index === 1 ? 'silver' :
              index === 2 ? 'bronze' : ''

            return (
              <div key={entry.member_id} className={`ranking-card ${medalClass}`}>
                <div className="ranking-position">
                  {index < 3 ? (
                    <span className="ranking-position-medal">{medals[index]}</span>
                  ) : (
                    <span className="ranking-position-number">#{index + 1}</span>
                  )}
                </div>

                <div className={`ranking-avatar ${medalClass}`}>
                  {entry.name.charAt(0).toUpperCase()}
                </div>

                <div className="ranking-info">
                  <p className={`ranking-name ${medalClass}`}>{entry.name}</p>
                  <p className="ranking-room">{entry.room_name}</p>
                </div>

                <div className="ranking-total-wrapper">
                  <p className={`ranking-total ${medalClass}`}>{entry.total}</p>
                  <p className="ranking-total-label">presenças</p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}