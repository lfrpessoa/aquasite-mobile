import { useCallback, useEffect, useState } from 'react'
import { AppState } from 'react-native'
import { HEARTBEAT_MS } from '../config/ambiente'
import { contas, notificacoes } from '../services/api'

export interface Presenca {
  naoLidas: number
  zerarNaoLidas: () => void
}

/**
 * Enquanto o app está aberto e logado: avisa a API que a pessoa está online (a bolinha verde
 * que aparece no site e no app) e acompanha o número de notificações não lidas.
 * Para quando o app vai para segundo plano.
 */
export function usePresenca(username: string | null): Presenca {
  const [naoLidas, setNaoLidas] = useState(0)

  useEffect(() => {
    if (!username) return
    let ativo = AppState.currentState !== 'background'
    const tique = () => {
      if (!ativo) return
      contas.online(username).catch(() => { /* sem rede: tenta no próximo */ })
      notificacoes.naoLidas(username).then(r => setNaoLidas(r?.count ?? 0)).catch(() => { /* idem */ })
    }
    tique()
    const id = setInterval(tique, HEARTBEAT_MS)
    const assinatura = AppState.addEventListener('change', estado => {
      ativo = estado === 'active'
      if (ativo) tique()
    })
    return () => {
      clearInterval(id)
      assinatura.remove()
    }
  }, [username])

  const zerarNaoLidas = useCallback(() => setNaoLidas(0), [])
  // sem login não há notificações (e o número da conta anterior não aparece)
  return { naoLidas: username ? naoLidas : 0, zerarNaoLidas }
}
