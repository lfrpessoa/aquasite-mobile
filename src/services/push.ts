import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'
import { requisitar } from './http'
import type { RespostaSimples } from '../types/api'

/**
 * Notificações push: o app registra o aparelho na MESMA API do site (POST /api/push/dispositivo);
 * quando alguém curte, comenta, segue, manda mensagem ou responde na Comunidade, a API grava a
 * notificação no banco (a mesma que o site mostra) e manda o push pelo serviço da Expo.
 *
 * Funciona no APK/app instalado (build do EAS). No Expo Go para Android o push remoto não existe
 * desde o SDK 53, e no navegador também não: nesses casos o app segue sem push, sem erro.
 */

let tokenAtual: string | null = null

export type ResultadoPush =
  | { ok: true; token: string }
  | { ok: false; motivo: 'web' | 'sem-projeto' | 'sem-permissao' | 'erro'; detalhe?: string }

/** Como mostrar o aviso quando ele chega com o app aberto, e o canal de avisos do Android. */
export async function configurarPush(): Promise<void> {
  if (Platform.OS === 'web') return
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
  })
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('avisos', {
      name: 'Avisos do AquaSite',
      importance: Notifications.AndroidImportance.HIGH,
      lightColor: '#00d4ff',
    })
  }
}

/** O projeto da Expo (EAS) identifica o app no serviço de push; ele é criado com "eas init". */
function idDoProjeto(): string | undefined {
  const extra = Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined
  return extra?.eas?.projectId ?? Constants.easConfig?.projectId
}

/** Pede permissão, pega o token do aparelho e registra na API para a conta logada. */
export async function registrarAparelho(): Promise<ResultadoPush> {
  if (Platform.OS === 'web') return { ok: false, motivo: 'web' }
  const projectId = idDoProjeto()
  if (!projectId) return { ok: false, motivo: 'sem-projeto' }
  try {
    let { status } = await Notifications.getPermissionsAsync()
    if (status !== 'granted') status = (await Notifications.requestPermissionsAsync()).status
    if (status !== 'granted') return { ok: false, motivo: 'sem-permissao' }
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId })
    const r = await requisitar<RespostaSimples>('/api/push/dispositivo', { metodo: 'POST', corpo: { token, plataforma: Platform.OS } })
    if (!r.success) return { ok: false, motivo: 'erro', detalhe: r.error }
    tokenAtual = token
    return { ok: true, token }
  } catch (e) {
    // no Expo Go para Android o token de push não existe: o app continua funcionando sem push
    return { ok: false, motivo: 'erro', detalhe: e instanceof Error ? e.message : String(e) }
  }
}

/** Ao sair da conta: este aparelho para de receber os avisos dela. */
export async function removerAparelho(): Promise<void> {
  if (!tokenAtual) return
  const token = tokenAtual
  tokenAtual = null
  try {
    await requisitar<RespostaSimples>('/api/push/dispositivo', { metodo: 'DELETE', corpo: { token } })
  } catch { /* sem conexão: a API limpa o token quando a Expo avisar que ele não vale mais */ }
}

export interface DadosPush {
  tipo?: string
  postId?: number
  remetente?: string
}

/** Chama `aoTocar` quando a pessoa toca num aviso (com o app aberto ou fechado). */
export function aoTocarNoAviso(aoTocar: (dados: DadosPush) => void): () => void {
  if (Platform.OS === 'web') return () => undefined
  const assinatura = Notifications.addNotificationResponseReceivedListener(resposta => {
    aoTocar(resposta.notification.request.content.data as DadosPush)
  })
  return () => assinatura.remove()
}
