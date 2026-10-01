import type { RaizParams } from '../types/navegacao'

/** Tela e parâmetros para onde levar a pessoa (formato aceito por navigation.navigate). */
export type Destino =
  | ['Post', RaizParams['Post']]
  | ['Chat', RaizParams['Chat']]
  | ['Usuario', RaizParams['Usuario']]

/** Tipos de notificação que falam de um post do feed (e trazem o id dele). */
const TIPOS_DE_POST = new Set(['like', 'comment', 'moderacao-oculto', 'moderacao-liberado'])

/**
 * Para onde vai quem toca numa notificação (na lista ou no aviso push):
 * curtida, comentário e moderação abrem o post; mensagem abre a conversa; seguidor abre o perfil.
 * null = sem destino próprio (quem chama decide, ex.: abrir a lista de notificações).
 */
export function destinoDoAviso(tipo: string | undefined, postId: number | null | undefined, remetente: string | undefined): Destino | null {
  if (tipo && TIPOS_DE_POST.has(tipo) && postId != null) return ['Post', { id: postId }]
  if (tipo === 'message' && remetente) return ['Chat', { username: remetente }]
  if (tipo === 'follow' && remetente) return ['Usuario', { username: remetente }]
  return null
}
