import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type Room = {
  id: string
  name: string
  type: string
}

const roomIcons: Record<string, string> = {
  children: '🧒',
  teenagers: '🧑',
  adults: '👨',
  seniors: '👴',
}

export default function Rooms() {
  const navigate = useNavigate()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRooms() {
      const { data } = await supabase.from('rooms').select('*')
      if (data) setRooms(data)
      setLoading(false)
    }
    fetchRooms()
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <span className="text-3xl">✝️</span>
          <h1 className="text-white text-2xl font-semibold mt-2">Church Connect</h1>
          <p className="text-gray-400 text-sm mt-1">Selecione uma sala</p>
        </div>

        {loading ? (
          <p className="text-gray-400 text-center">Carregando...</p>
        ) : (
          <div className="flex flex-col gap-3">
            {rooms.map(room => (
              <button
                key={room.id}
                onClick={() => navigate(`/rooms/${room.id}`)}
                className="bg-gray-900 hover:bg-gray-800 text-white rounded-2xl px-6 py-5 flex items-center gap-4 transition"
              >
                <span className="text-3xl">{roomIcons[room.type]}</span>
                <div className="text-left">
                  <p className="font-medium">{room.name}</p>
                  <p className="text-gray-400 text-sm capitalize">{room.type}</p>
                </div>
                <span className="ml-auto text-gray-600">›</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <button
          onClick={() => navigate('/ranking')}
          className="mt-4 w-full bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-2xl px-6 py-4 flex items-center gap-4 transition"
        >
          <span className="text-2xl">🏆</span>
          <p className="font-medium">Ver Ranking</p>
          <span className="ml-auto text-gray-600">›</span>
        </button>
    </div>
  )
}