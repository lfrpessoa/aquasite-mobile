import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Post } from '../types/api'

/**
 * Cópia local do último feed carregado, só para LEITURA quando a API não responde (sem internet,
 * servidor dormindo). Não substitui o banco: nada é gravado aqui além do que já veio da API, e
 * qualquer ação (publicar, curtir, comentar) continua indo para a API.
 */
const CHAVE_FEED = 'aquasite.cache.feed'
const LIMITE_IMAGEM = 300_000   // fotos maiores que ~300 KB não entram na cópia
const LIMITE_TOTAL = 2_000_000  // a cópia inteira fica abaixo de ~2 MB

export interface FeedSalvo {
  posts: Post[]
  salvoEm: number
}

/** Guarda a primeira página do feed de quem está logado. */
export async function salvarFeed(username: string, posts: Post[]): Promise<void> {
  let total = 0
  const leves = posts.map(p => {
    const imagem = p.image && p.image.length <= LIMITE_IMAGEM && total + p.image.length <= LIMITE_TOTAL ? p.image : null
    total += (imagem?.length ?? 0) + p.content.length
    return { ...p, image: imagem }
  })
  const dados: FeedSalvo = { posts: leves, salvoEm: Date.now() }
  try {
    await AsyncStorage.setItem(`${CHAVE_FEED}.${username}`, JSON.stringify(dados))
  } catch { /* sem espaço: o app continua funcionando, só sem a cópia */ }
}

export async function lerFeedSalvo(username: string): Promise<FeedSalvo | null> {
  try {
    const texto = await AsyncStorage.getItem(`${CHAVE_FEED}.${username}`)
    return texto ? (JSON.parse(texto) as FeedSalvo) : null
  } catch {
    return null
  }
}

/** Ao sair da conta, apaga a cópia daquela conta. */
export async function apagarCache(username: string): Promise<void> {
  try { await AsyncStorage.removeItem(`${CHAVE_FEED}.${username}`) } catch { /* nada a apagar */ }
}
