import { Alert, Platform } from 'react-native'
import type { AlertButton } from 'react-native'

/**
 * Janela de confirmação com botões. No celular é o Alert nativo; na versão web o Alert com botões
 * não faz nada (react-native-web não implementa), então usa o confirm() do navegador:
 * uma pergunta por opção, na ordem, e a primeira que a pessoa aceitar é executada.
 */
export function perguntar(titulo: string, texto: string | undefined, botoes: AlertButton[]): void {
  if (Platform.OS !== 'web') {
    Alert.alert(titulo, texto, botoes)
    return
  }
  const opcoes = botoes.filter(b => b.style !== 'cancel')
  const unica = opcoes.length === 1
  for (const b of opcoes) {
    const pergunta = unica ? [titulo, texto].filter(Boolean).join('\n\n') : `${titulo}\n\n${b.text}?`
    if (window.confirm(pergunta)) {
      b.onPress?.()
      return
    }
  }
}
