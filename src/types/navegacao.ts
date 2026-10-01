import type { NavigatorScreenParams } from '@react-navigation/native'
import type { TipoGrupo } from './api'

/** Abas da parte logada do app. */
export type AbasParams = {
  Feed: undefined
  Mapa: undefined
  Especies: undefined
  /** abrir = veio de um link compartilhado: abre os detalhes dessa ONG/comunidade */
  Comunidade: { abrir?: { tipo: TipoGrupo; id: number } } | undefined
  Mensagens: undefined
  Perfil: undefined
}

/** Todas as telas empilháveis (logado ou visitante). */
export type RaizParams = {
  // visitante
  Entrar: { sessaoExpirada?: boolean } | undefined
  // logado
  Abas: NavigatorScreenParams<AbasParams> | undefined
  Usuario: { username: string }
  Chat: { username: string }
  /** comentarioId = veio do link de um comentário: ele fica destacado */
  Post: { id: number; comentarioId?: number }
  Notificacoes: undefined
  Busca: undefined
  /** nome falta quando a tela é aberta por um link; postId/comentarioId = post e comentário do link */
  FeedComunidade: { tipo: TipoGrupo; id: number; nome?: string; postId?: number; comentarioId?: number }
  Admin: undefined
  // abertas para todos
  MapaVisitante: undefined
  Curiosidades: undefined
  Animais: undefined
  Sobre: undefined
}
