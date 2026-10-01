import { alvos, caminhos, lerLinkAquaSite, linkCompleto, textoDaMensagem } from '../utils/compartilhar'
import { SITE_URL } from '../config/ambiente'
import type { Post } from '../types/api'

const post = { id: 12, user: '@marina.alves', content: 'Tartarugas   nasceram\nhoje!', comments: [], likes: 0 } as unknown as Post

describe('links de compartilhar (os mesmos do site)', () => {
  it('monta os caminhos', () => {
    expect(caminhos.post(12)).toBe('/post/12')
    expect(caminhos.comentario(12, 40)).toBe('/post/12?comentario=40')
    expect(caminhos.grupo('ong', 5)).toBe('/comunidade?ver=ong-5')
    expect(caminhos.postDoGrupo('comunidade', 3, 8)).toBe('/comunidade/3?post=8')
    expect(caminhos.comentarioDoGrupo('ong', 5, 8, 9)).toBe('/comunidade/ong/5?post=8&comentario=9')
  })

  it('o link aponta para o site', () => {
    expect(linkCompleto('/post/12')).toBe(`${SITE_URL}/post/12`)
  })

  it('a mensagem leva recado, resumo e link', () => {
    const texto = textoDaMensagem(alvos.post(post), ' olha isso ')
    expect(texto).toBe(`olha isso\nPost de @marina.alves: "Tartarugas nasceram hoje!"\n${SITE_URL}/post/12`)
    expect(textoDaMensagem(alvos.post(post))).not.toMatch(/^\n/)
  })

  it('lê de volta cada tipo de link', () => {
    expect(lerLinkAquaSite(`${SITE_URL}/post/12`)).toMatchObject({ tela: 'Post', id: 12, rotulo: 'Abrir post' })
    expect(lerLinkAquaSite(`${SITE_URL}/post/12?comentario=40`)).toMatchObject({ tela: 'Post', id: 12, comentarioId: 40, rotulo: 'Abrir comentário' })
    expect(lerLinkAquaSite(`${SITE_URL}/comunidade?ver=comunidade-3`)).toMatchObject({ tela: 'Grupo', tipo: 'comunidade', id: 3 })
    expect(lerLinkAquaSite(`${SITE_URL}/comunidade/ong/5?post=8&comentario=9`))
      .toMatchObject({ tela: 'FeedComunidade', tipo: 'ong', id: 5, postId: 8, comentarioId: 9 })
    expect(lerLinkAquaSite('https://aquasite-mobile.vercel.app/comunidade/3')).toMatchObject({ tela: 'FeedComunidade', id: 3, rotulo: 'Abrir feed' })
  })

  it('ignora links de outros sites e caminhos desconhecidos', () => {
    expect(lerLinkAquaSite('https://g1.globo.com/post/12')).toBeNull()
    expect(lerLinkAquaSite(`${SITE_URL}/mapa`)).toBeNull()
    expect(lerLinkAquaSite(`${SITE_URL}/comunidade?ver=xyz`)).toBeNull()
  })
})
