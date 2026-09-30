/** "agora", "5min", "3h", "2d" a partir de uma data ISO (igual ao site). */
export function tempoAtras(data: string | null | undefined): string {
  if (!data) return ''
  const diff = Math.floor((Date.now() - new Date(data.replace(' ', 'T')).getTime()) / 1000)
  if (Number.isNaN(diff)) return ''
  if (diff < 60) return 'agora'
  if (diff < 3600) return `${Math.floor(diff / 60)}min`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

/** Hora "14:05" de uma data ISO. */
export function hora(data: string | null | undefined): string {
  if (!data) return ''
  const d = new Date(data.replace(' ', 'T'))
  if (Number.isNaN(d.getTime())) return ''
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** Número em pt-BR com casas fixas; "–" quando não há valor. */
export function numero(v: number | null | undefined, casas = 1): string {
  if (v == null || Number.isNaN(v)) return '–'
  return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })
}

/** "@marina.alves" → "marina.alves" (os posts do feed geral vêm com @ na frente). */
export const semArroba = (s: string | null | undefined): string => (s ?? '').replace(/^@/, '')

/** "seg., 02" a partir de "2026-10-02". */
export function diaSemana(dataIso: string): string {
  const d = new Date(`${dataIso}T12:00`)
  const dias = ['dom.', 'seg.', 'ter.', 'qua.', 'qui.', 'sex.', 'sáb.']
  return `${dias[d.getDay()]} ${String(d.getDate()).padStart(2, '0')}`
}

export function duracao(min: number): string {
  if (min < 60) return `${Math.round(min)} min`
  return `${Math.floor(min / 60)}h${String(Math.round(min % 60)).padStart(2, '0')}`
}
