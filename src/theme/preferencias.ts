import AsyncStorage from '@react-native-async-storage/async-storage'
import { reloadAppAsync } from 'expo'
import { PREFERENCIAS_PADRAO, aplicarPreferencias } from './cores'
import type { Preferencias } from './cores'

/** Aparência e acessibilidade escolhidas no app (tema claro/escuro, alto contraste, menos animações). */
const CHAVE = 'aquasite.preferencias'

/** Lê a escolha salva no aparelho e aplica nas cores. O App chama isto antes de carregar as telas. */
export async function carregarPreferencias(): Promise<Preferencias> {
  let p: Preferencias = PREFERENCIAS_PADRAO
  try {
    const texto = await AsyncStorage.getItem(CHAVE)
    if (texto) p = { ...PREFERENCIAS_PADRAO, ...(JSON.parse(texto) as Partial<Preferencias>) }
  } catch { /* sem preferências salvas: usa o padrão (tema escuro) */ }
  aplicarPreferencias(p)
  return p
}

/** Salva a escolha e reinicia o app para todas as telas usarem as cores novas. */
export async function salvarPreferencias(p: Preferencias): Promise<void> {
  await AsyncStorage.setItem(CHAVE, JSON.stringify(p))
  await reloadAppAsync('Aparência alterada')
}
