import type { NavigatorScreenParams } from '@react-navigation/native'
import type { TipoGrupo } from './api'

/** Abas da parte logada do app. */
export type AbasParams = {
  Feed: undefined
  Mapa: undefined
  Comunidade: undefined
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
  Notificacoes: undefined
  Busca: undefined
  FeedComunidade: { tipo: TipoGrupo; id: number; nome: string }
  Admin: undefined
  // abertas para todos
  MapaVisitante: undefined
  Curiosidades: undefined
  Animais: undefined
  Sobre: undefined
}
