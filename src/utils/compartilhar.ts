import { SITE_URL } from '../config/ambiente'
import type { ComentarioComunidade, ComentarioPost, Post, PostComunidade, TipoGrupo } from '../types/api'
import { semArroba } from './formatar'

/**
 * Links de compartilhamento — os MESMOS do site (aquasite-react/src/servicos/compartilhar.js):
 *
 *   /post/12                          post do feed
 *   /post/12?comentario=40            comentário de um post do feed
 *   /comunidade?ver=comunidade-3      comunidade (ONG: ver=ong-5)
 *   /comunidade/3?post=8              post do feed de uma comunidade (ONG: /comunidade/ong/5?post=8)
 *   /comunidade/3?post=8&comentario=9 comentário de um post de comunidade
 *
 * O link aponta para o site, então abre em qualquer navegador. Dentro do app (nas mensagens),
 * um link desses abre a tela certa do próprio app.
 */

/** Endereços em que o AquaSite está publicado: links deles são tratados como links "de dentro". */
const SITES = [hostDe(SITE_URL), 'aquasite-frontend-aquasite-react.vercel.app', 'aquasite-mobile.vercel.app']

function hostDe(url: string): string {
  const m = /^https?:\/\/([^/?#]+)/i.exec(url)
  return m ? m[1].toLowerCase() : ''
}

const feedDoGrupo = (tipo: TipoGrupo, id: number) => (tipo === 'ong' ? `/comunidade/ong/${id}` : `/comunidade/${id}`)

export const caminhos = {
  post: (id: number) => `/post/${id}`,
  comentario: (postId: number, comentarioId: number) => `/post/${postId}?comentario=${comentarioId}`,
  grupo: (tipo: TipoGrupo, id: number) => `/comunidade?ver=${tipo}-${id}`,
  postDoGrupo: (tipo: TipoGrupo, id: number, postId: number) => `${feedDoGrupo(tipo, id)}?post=${postId}`,
  comentarioDoGrupo: (tipo: TipoGrupo, id: number, postId: number, comentarioId: number) =>
    `${feedDoGrupo(tipo, id)}?post=${postId}&comentario=${comentarioId}`,
}

export const linkCompleto = (caminho: string) => `${SITE_URL}${caminho}`

/** O que vai ser compartilhado: título (da janela), resumo (vai na mensagem) e caminho do link. */
export interface AlvoCompartilhar {
  titulo: string
  resumo: string
  caminho: string
}

function trecho(texto: string | null | undefined, max = 120): string {
  const t = (texto ?? '').replace(/\s+/g, ' ').trim()
  return t.length > max ? `${t.slice(0, max)}…` : t
}

const nomeDoGrupo = (tipo: TipoGrupo, nome?: string) => nome || (tipo === 'ong' ? 'uma ONG' : 'uma comunidade')

export const alvos = {
  post: (p: Post): AlvoCompartilhar => ({
    titulo: `Post de @${semArroba(p.user)}`,
    resumo: `Post de @${semArroba(p.user)}${p.content ? `: "${trecho(p.content)}"` : ''}`,
    caminho: caminhos.post(p.id),
  }),
  comentario: (postId: number, c: ComentarioPost): AlvoCompartilhar => ({
    titulo: `Comentário de @${semArroba(c.user)}`,
    resumo: `Comentário de @${semArroba(c.user)}: "${trecho(c.text)}"`,
    caminho: caminhos.comentario(postId, c.id),
  }),
  grupo: (tipo: TipoGrupo, g: { id: number; nome: string }): AlvoCompartilhar => ({
    titulo: g.nome,
    resumo: `${tipo === 'ong' ? 'ONG' : 'Comunidade'} ${g.nome} no AquaSite`,
    caminho: caminhos.grupo(tipo, g.id),
  }),
  postDoGrupo: (tipo: TipoGrupo, grupoId: number, nome: string | undefined, p: PostComunidade): AlvoCompartilhar => ({
    titulo: `Post de @${p.autor}`,
    resumo: `Post de @${p.autor} em ${nomeDoGrupo(tipo, nome)}${p.conteudo ? `: "${trecho(p.conteudo)}"` : ''}`,
    caminho: caminhos.postDoGrupo(tipo, grupoId, p.id),
  }),
  comentarioDoGrupo: (tipo: TipoGrupo, grupoId: number, nome: string | undefined, postId: number, c: ComentarioComunidade): AlvoCompartilhar => ({
    titulo: `Comentário de @${c.autor}`,
    resumo: `Comentário de @${c.autor} em ${nomeDoGrupo(tipo, nome)}: "${trecho(c.texto)}"`,
    caminho: caminhos.comentarioDoGrupo(tipo, grupoId, postId, c.id),
  }),
}

/** Texto da mensagem enviada a outra pessoa: o recado (opcional), o resumo e o link. */
export const textoDaMensagem = (alvo: AlvoCompartilhar, recado = '') =>
  [recado.trim(), alvo.resumo, linkCompleto(alvo.caminho)].filter(Boolean).join('\n')

/** Para onde um link do AquaSite leva dentro do app. */
export type LinkInterno =
  | { tela: 'Post'; id: number; comentarioId?: number; rotulo: string }
  | { tela: 'Grupo'; tipo: TipoGrupo; id: number; rotulo: string }
  | { tela: 'FeedComunidade'; tipo: TipoGrupo; id: number; postId?: number; comentarioId?: number; rotulo: string }

/** Se `url` for um link do AquaSite, diz qual tela abrir; senão, null. */
export function lerLinkAquaSite(url: string): LinkInterno | null {
  const m = /^https?:\/\/([^/?#]+)(\/[^?#]*)?(\?[^#]*)?/i.exec(url.trim())
  if (!m || !SITES.includes(m[1].toLowerCase())) return null
  const caminho = (m[2] ?? '/').replace(/\/+$/, '') || '/'
  const q = new Map<string, string>()
  for (const par of (m[3] ?? '').replace(/^\?/, '').split('&')) {
    const [k, v] = par.split('=')
    if (k) q.set(decodeURIComponent(k), decodeURIComponent(v ?? ''))
  }
  const numero = (v: string | undefined) => (v && /^\d+$/.test(v) ? Number(v) : undefined)

  let r: RegExpExecArray | null
  if ((r = /^\/post\/(\d+)$/.exec(caminho))) {
    const comentarioId = numero(q.get('comentario'))
    return { tela: 'Post', id: Number(r[1]), comentarioId, rotulo: comentarioId ? 'Abrir comentário' : 'Abrir post' }
  }
  if (caminho === '/comunidade') {
    const ver = /^(ong|comunidade)-(\d+)$/.exec(q.get('ver') ?? '')
    if (!ver) return null
    const tipo = ver[1] as TipoGrupo
    return { tela: 'Grupo', tipo, id: Number(ver[2]), rotulo: tipo === 'ong' ? 'Abrir ONG' : 'Abrir comunidade' }
  }
  if ((r = /^\/comunidade\/(ong\/)?(\d+)$/.exec(caminho))) {
    const postId = numero(q.get('post'))
    const comentarioId = numero(q.get('comentario'))
    return {
      tela: 'FeedComunidade', tipo: r[1] ? 'ong' : 'comunidade', id: Number(r[2]), postId, comentarioId,
      rotulo: comentarioId ? 'Abrir comentário' : postId ? 'Abrir post' : 'Abrir feed',
    }
  }
  return null
}
