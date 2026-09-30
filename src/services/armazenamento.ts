import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

/**
 * Guarda a sessão (token JWT e dados da conta) no aparelho.
 * No celular usa o SecureStore (Keychain/Keystore); no navegador, onde ele não existe, usa o localStorage.
 */
const naWeb = Platform.OS === 'web'

export async function ler(chave: string): Promise<string | null> {
  if (naWeb) {
    try { return globalThis.localStorage?.getItem(chave) ?? null } catch { return null }
  }
  return SecureStore.getItemAsync(chave)
}

export async function gravar(chave: string, valor: string): Promise<void> {
  if (naWeb) {
    try { globalThis.localStorage?.setItem(chave, valor) } catch { /* sem armazenamento: vale só nesta visita */ }
    return
  }
  await SecureStore.setItemAsync(chave, valor)
}

export async function apagar(chave: string): Promise<void> {
  if (naWeb) {
    try { globalThis.localStorage?.removeItem(chave) } catch { /* nada a apagar */ }
    return
  }
  await SecureStore.deleteItemAsync(chave)
}
