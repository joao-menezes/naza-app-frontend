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
        .select(`
          member_id,
          present,
          profiles (
            name,
            rooms ( name )
          )
        `)
        .eq('present', true)

      if (!data) return

      // Agrupa por membro e conta presenças
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

      const sorted = Object.values(map).sort((a, b) => b.total - a.total)
      setRanking(sorted)
      setLoading(false)
    }

    fetchRanking()
  }, [])

  const medals = ['🥇', '🥈', '🥉']

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
          <h1 className="text-white text-2xl font-semibold">🏆 Ranking</h1>
          <p className="text-gray-400 text-sm mt-1">Membros com mais presenças</p>
        </div>

        {loading ? (
          <p className="text-gray-400 text-center">Carregando...</p>
        ) : ranking.length === 0 ? (
          <p className="text-gray-400 text-center">Nenhuma presença registrada ainda.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {ranking.map((entry, index) => (
              <div
                key={entry.member_id}
                className={`rounded-2xl px-6 py-4 flex items-center gap-4 ${
                  index === 0
                    ? 'bg-yellow-500/10 border border-yellow-500/30'
                    : index === 1
                    ? 'bg-gray-400/10 border border-gray-400/20'
                    : index === 2
                    ? 'bg-orange-400/10 border border-orange-400/20'
                    : 'bg-gray-900'
                }`}
              >
                <span className="text-2xl w-8 text-center">
                  {medals[index] ?? `${index + 1}`}
                </span>
                <div className="flex-1">
                  <p className="text-white font-medium">{entry.name}</p>
                  <p className="text-gray-400 text-sm">{entry.room_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-lg">{entry.total}</p>
                  <p className="text-gray-400 text-xs">presenças</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}