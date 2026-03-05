import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { supabase } from './supabase'

export async function exportRelatorio() {
  const doc = new jsPDF()
  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  let y = 20

  // ─── Header ───────────────────────────────────────────
  doc.setFontSize(18)
  doc.setTextColor(30, 30, 30)
  doc.text('Igreja do Nazareno', 14, y)

  y += 8
  doc.setFontSize(10)
  doc.setTextColor(120, 120, 120)
  doc.text(`Relatório gerado em: ${today}`, 14, y)

  y += 4
  doc.setDrawColor(201, 168, 76)
  doc.setLineWidth(0.5)
  doc.line(14, y, 196, y)
  y += 10

  // ─── 1. Membros por sala ───────────────────────────────
  const { data: rooms } = await supabase.from('rooms').select('*')
  const { data: members } = await supabase
    .from('profiles')
    .select('*, rooms(name)')
    .order('name')

  doc.setFontSize(13)
  doc.setTextColor(30, 30, 30)
  doc.text('1. Membros por Sala', 14, y)
  y += 6

  if (rooms && members) {
    for (const room of rooms) {
      const roomMembers = members.filter((m: any) => m.room_id === room.id)

      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(`${room.name} (${roomMembers.length} membros)`, 14, y)
      y += 4

      autoTable(doc, {
        startY: y,
        head: [['Nome']],
        body: roomMembers.map((m: any) => [m.name]),
        theme: 'striped',
        headStyles: { fillColor: [201, 168, 76], textColor: 0 },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 },
      })

      y = (doc as any).lastAutoTable.finalY + 8
    }
  }

  // ─── 2. Frequência por membro ──────────────────────────
  doc.setFontSize(13)
  doc.setTextColor(30, 30, 30)
  doc.text('2. Frequência por Membro', 14, y)
  y += 6

  const { data: attendance } = await supabase
    .from('attendance')
    .select('member_id, present, profiles(name, rooms(name))')
    .eq('present', true)

  const { data: sessions } = await supabase.from('sessions').select('*')

  if (attendance && sessions && members) {
    const totalSessions = sessions.length

    const map: Record<string, { name: string; room: string; total: number }> = {}
    attendance.forEach((a: any) => {
      const id = a.member_id
      if (!map[id]) {
        map[id] = {
          name: a.profiles?.name ?? '-',
          room: a.profiles?.rooms?.name ?? '-',
          total: 0,
        }
      }
      map[id].total += 1
    })

    const rows = Object.values(map)
      .sort((a, b) => b.total - a.total)
      .map(m => [
        m.name,
        m.room,
        `${m.total}`,
        totalSessions > 0 ? `${Math.round((m.total / totalSessions) * 100)}%` : '0%',
      ])

    autoTable(doc, {
      startY: y,
      head: [['Nome', 'Sala', 'Presenças', '%']],
      body: rows,
      theme: 'striped',
      headStyles: { fillColor: [201, 168, 76], textColor: 0 },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    })

    y = (doc as any).lastAutoTable.finalY + 8
  }

  // ─── 3. Ranking ───────────────────────────────────────
  doc.setFontSize(13)
  doc.setTextColor(30, 30, 30)
  doc.text('3. Ranking de Presença', 14, y)
  y += 6

  if (attendance) {
    const rankMap: Record<string, { name: string; room: string; total: number }> = {}
    attendance.forEach((a: any) => {
      const id = a.member_id
      if (!rankMap[id]) {
        rankMap[id] = {
          name: a.profiles?.name ?? '-',
          room: a.profiles?.rooms?.name ?? '-',
          total: 0,
        }
      }
      rankMap[id].total += 1
    })

    const rankRows = Object.values(rankMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
      .map((m, i) => [`${i + 1}º`, m.name, m.room, `${m.total}`])

    autoTable(doc, {
      startY: y,
      head: [['#', 'Nome', 'Sala', 'Presenças']],
      body: rankRows,
      theme: 'striped',
      headStyles: { fillColor: [201, 168, 76], textColor: 0 },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    })
  }

  // ─── Footer ───────────────────────────────────────────
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(180, 180, 180)
    doc.text(`Página ${i} de ${pageCount}`, 14, 290)
    doc.text('Igreja do Nazareno', 160, 290)
  }

  doc.save(`relatorio-nazareno-${new Date().toISOString().split('T')[0]}.pdf`)
}