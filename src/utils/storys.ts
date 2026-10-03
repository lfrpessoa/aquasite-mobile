import type { NomeIcone } from '../components/Icone'
import type { GrupoStorys, ItemDestaque, Post, Story } from '../types/api'

/** Ícones dos destaques: o nome que a API guarda e o ícone que o app (e o site) desenha. */
export const ICONES_DESTAQUE: { id: string; icone: NomeIcone; nome: string }[] = [
  { id: 'onda', icone: 'waves', nome: 'Onda' },
  { id: 'peixe', icone: 'fish', nome: 'Peixe' },
  { id: 'tartaruga', icone: 'tartaruga', nome: 'Tartaruga' },
  { id: 'lixo', icone: 'trash', nome: 'Mutirão' },
  { id: 'maos', icone: 'users', nome: 'Pessoas' },
  { id: 'lampada', icone: 'lampada', nome: 'Dica' },
  { id: 'coral', icone: 'coral', nome: 'Coral' },
  { id: 'estrela', icone: 'estrela', nome: 'Estrela' },
]

export const iconeDoDestaque = (id: string): NomeIcone => ICONES_DESTAQUE.find(i => i.id === id)?.icone ?? 'estrela'

export const MAX_TEXTO_STORY = 150

/** Um item que o visor mostra: um story ou um post guardado num destaque. */
export interface ItemVisor {
  tipo: 'story' | 'post'
  id: number
  imagem: string | null
  texto: string | null
  created_at: string | null
  visto?: boolean
  visualizacoes?: number
}

/** Um "grupo" do visor: os storys de uma pessoa ou os itens de um destaque. */
export interface GrupoVisor {
  chave: string
  titulo: string
  /** nome usado na inicial do avatar quando não há foto */
  nome: string
  avatar: string | null
  meu: boolean
  icone?: NomeIcone
  itens: ItemVisor[]
}

export const storyParaItem = (s: Story): ItemVisor => ({
  tipo: 'story', id: s.id, imagem: s.imagem, texto: s.texto, created_at: s.created_at, visto: s.visto, visualizacoes: s.visualizacoes,
})

export const grupoParaVisor = (g: GrupoStorys): GrupoVisor => ({
  chave: g.autor, titulo: g.meu ? 'Seu story' : g.autor, nome: g.autor, avatar: g.avatar, meu: g.meu, itens: g.storys.map(storyParaItem),
})

export const destaqueParaVisor = (d: { id: number; nome: string; icone: string; capa: string | null; itens: ItemDestaque[] }, dono: boolean): GrupoVisor => ({
  chave: String(d.id), titulo: d.nome, nome: d.nome, avatar: d.capa, meu: dono, icone: iconeDoDestaque(d.icone),
  itens: d.itens.map(i => ({ ...i, visto: true })),
})

/** Onde começar a ver os storys de uma pessoa: no primeiro que ainda não foi visto. */
export const primeiroNaoVisto = (g: GrupoStorys): number => Math.max(0, g.storys.findIndex(s => !s.visto))

/** Depois de ver um story: marca como visto e recalcula quantos faltam (o anel apaga quando chega a zero). */
export function marcarVistoNaLista(grupos: GrupoStorys[], storyId: number): GrupoStorys[] {
  return grupos.map(g => {
    if (!g.storys.some(s => s.id === storyId)) return g
    const storys = g.storys.map(s => (s.id === storyId ? { ...s, visto: true } : s))
    return { ...g, storys, naoVistos: g.meu ? 0 : storys.filter(s => !s.visto).length }
  })
}

/** Cores dos quadrados de posts só com texto na grade do perfil (sempre a mesma cor para o mesmo post). */
const CORES_TEXTO: [string, string][] = [['#00b4d8', '#0077b6'], ['#4ecdc4', '#1b7f79'], ['#5e60ce', '#3a0ca3'], ['#f4845f', '#c0392b'], ['#2a9d8f', '#1d6f65'], ['#e9c46a', '#b5830f']]
export const corDoPostTexto = (id: number): [string, string] => CORES_TEXTO[Math.abs(id) % CORES_TEXTO.length]

/** Opções para montar um destaque: storys no ar, storys que já estão nele (mesmo vencidos) e os posts. */
export function opcoesDoDestaque(storysNoAr: Story[], itensAtuais: ItemDestaque[], posts: Post[]): ItemVisor[] {
  const lista: ItemVisor[] = []
  const vistos = new Set<string>()
  const incluir = (i: ItemVisor) => {
    const k = `${i.tipo}-${i.id}`
    if (!vistos.has(k)) { vistos.add(k); lista.push(i) }
  }
  ;[...storysNoAr].reverse().forEach(s => incluir(storyParaItem(s)))
  itensAtuais.filter(i => i.tipo === 'story').forEach(i => incluir(i))
  posts.forEach(p => incluir({ tipo: 'post', id: p.id, imagem: p.image, texto: p.content, created_at: p.created_at ?? null }))
  return lista
}
