import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { destinoDoAviso } from '../utils/destino'
import { erroNoNome } from '../utils/nome'
import { definirToken } from '../services/http'
import { feed, praias } from '../services/api'
import { API_URL } from '../config/ambiente'
import PostCard from '../components/PostCard'
import type { Post } from '../types/api'

// Tela de detalhe do post, avisos com foto/GPS e troca de nome. O fetch é simulado.

describe('para onde leva uma notificação (lista e push)', () => {
  it('curtida, comentário e moderação abrem o post', () => {
    expect(destinoDoAviso('like', 7, 'ana')).toEqual(['Post', { id: 7 }])
    expect(destinoDoAviso('comment', 8, 'ana')).toEqual(['Post', { id: 8 }])
    expect(destinoDoAviso('moderacao-oculto', 9, 'AquaSite')).toEqual(['Post', { id: 9 }])
  })
  it('mensagem abre a conversa e seguidor abre o perfil', () => {
    expect(destinoDoAviso('message', null, 'caio')).toEqual(['Chat', { username: 'caio' }])
    expect(destinoDoAviso('follow', null, 'bia')).toEqual(['Usuario', { username: 'bia' }])
  })
  it('sem destino próprio (ex.: comunidade ou post sem id) devolve null', () => {
    expect(destinoDoAviso('comunidade-pedido', null, 'x')).toBeNull()
    expect(destinoDoAviso('like', null, 'x')).toBeNull()
    expect(destinoDoAviso(undefined, undefined, undefined)).toBeNull()
  })
})

describe('regra do nome de usuário (a mesma da API)', () => {
  it('aceita letras, números, ponto, hífen e sublinhado', () => {
    expect(erroNoNome('marina.alves')).toBeNull()
    expect(erroNoNome('ana_mar-2026')).toBeNull()
  })
  it('recusa curto, longo, com espaço, @ ou barra', () => {
    expect(erroNoNome('ab')).toMatch(/3 a 30/)
    expect(erroNoNome('a'.repeat(31))).toMatch(/3 a 30/)
    expect(erroNoNome('ana maria')).toMatch(/sem espaços/)
    expect(erroNoNome('@ana')).not.toBeNull()
    expect(erroNoNome('ana/mar')).not.toBeNull()
  })
})

interface Chamada { url: string; init: RequestInit }
let chamadas: Chamada[] = []
const MEDIDAS = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } }
const responder = (status: number, corpo: unknown) => {
  global.fetch = jest.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
    chamadas.push({ url: String(url), init: init ?? {} })
    return { ok: status >= 200 && status < 300, status, text: async () => JSON.stringify(corpo) } as Response
  }) as jest.Mock
}

describe('endpoints novos', () => {
  beforeEach(() => { chamadas = []; definirToken('tk'); responder(200, { success: true }) })

  it('um post só: GET /api/posts/{id}', async () => {
    await feed.obter(36)
    expect(chamadas[0].url).toBe(`${API_URL}/api/posts/36`)
  })

  it('aviso de praia com foto e coordenadas do GPS', async () => {
    await praias.avisar({ praia: 'Praia de Santos', uf: 'SP', categoria: 'poluicao', descricao: 'Lixo na areia',
      foto: 'data:image/jpeg;base64,AAAA', latitude: -23.97, longitude: -46.33 })
    const corpo = JSON.parse(String(chamadas[0].init.body))
    expect(chamadas[0].url).toBe(`${API_URL}/api/beach-reports`)
    expect(corpo).toMatchObject({ foto: 'data:image/jpeg;base64,AAAA', latitude: -23.97, longitude: -46.33 })
  })

  it('404 do post apagado chega com status para a tela mostrar "não está mais disponível"', async () => {
    responder(404, { success: false, error: 'Post não encontrado' })
    await expect(feed.obter(999)).rejects.toMatchObject({ status: 404 })
  })
})

describe('PostCard na tela de detalhe', () => {
  const post: Post = {
    id: 1, user: '@bia', content: 'Tartarugas na praia hoje', image: null, likes: 2, curtiu: false, time: '10:00',
    comments: [{ id: 5, user: 'caio', text: 'Que lindo!' }],
  }
  it('já abre com os comentários à mostra', async () => {
    await render(<SafeAreaProvider initialMetrics={MEDIDAS}><PostCard post={post} eu="ana" comentariosAbertos onComentar={async () => true} /></SafeAreaProvider>)
    expect(screen.getByText(/Que lindo!/)).toBeTruthy()
  })
  it('no feed os comentários começam fechados e abrem ao tocar', async () => {
    await render(<SafeAreaProvider initialMetrics={MEDIDAS}><PostCard post={post} eu="ana" onComentar={async () => true} /></SafeAreaProvider>)
    expect(screen.queryByText(/Que lindo!/)).toBeNull()
    await fireEvent.press(screen.getByLabelText(/coment/i))
    expect(screen.getByText(/Que lindo!/)).toBeTruthy()
  })
})
