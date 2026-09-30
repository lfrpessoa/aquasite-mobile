import AsyncStorage from '@react-native-async-storage/async-storage'
import { apagarCache, lerFeedSalvo, salvarFeed } from '../services/cache'
import type { Post } from '../types/api'

const post = (id: number, image: string | null = null): Post => ({
  id, user: '@ana', content: `post ${id}`, image, likes: 0, time: '10:00', comments: [],
})

beforeEach(async () => { await AsyncStorage.clear() })

describe('cópia local do feed (só leitura quando não há conexão)', () => {
  it('guarda e lê o feed da conta', async () => {
    await salvarFeed('ana', [post(2), post(1)])
    const salvo = await lerFeedSalvo('ana')
    expect(salvo?.posts.map(p => p.id)).toEqual([2, 1])
    expect(typeof salvo?.salvoEm).toBe('number')
  })

  it('cada conta tem a sua cópia', async () => {
    await salvarFeed('ana', [post(1)])
    expect(await lerFeedSalvo('bia')).toBeNull()
  })

  it('fotos grandes não entram na cópia (o post fica, sem a foto)', async () => {
    const grande = `data:image/jpeg;base64,${'A'.repeat(400_000)}`
    const pequena = `data:image/jpeg;base64,${'B'.repeat(1_000)}`
    await salvarFeed('ana', [post(2, grande), post(1, pequena)])
    const salvo = await lerFeedSalvo('ana')
    expect(salvo?.posts[0].image).toBeNull()
    expect(salvo?.posts[1].image).toBe(pequena)
  })

  it('sair da conta apaga a cópia', async () => {
    await salvarFeed('ana', [post(1)])
    await apagarCache('ana')
    expect(await lerFeedSalvo('ana')).toBeNull()
  })
})
