import {
  ICONES_DESTAQUE, corDoPostTexto, destaqueParaVisor, grupoParaVisor, iconeDoDestaque, marcarVistoNaLista,
  opcoesDoDestaque, primeiroNaoVisto,
} from '../utils/storys'
import { alvos, caminhos, lerLinkAquaSite } from '../utils/compartilhar'
import { SITE_URL } from '../config/ambiente'
import type { GrupoStorys, Post, Story } from '../types/api'

const story = (id: number, visto: boolean, extra: Partial<Story> = {}): Story => ({
  id, autor: 'pedro.mar', imagem: `https://api/storys/${id}/imagem`, texto: null,
  created_at: '2026-10-03T10:00:00', expira_em: '2026-10-04T10:00:00', visto, ...extra,
})
const grupo = (autor: string, storys: Story[], meu = false): GrupoStorys => ({
  autor, avatar: null, meu, naoVistos: meu ? 0 : storys.filter(s => !s.visto).length, ultimo: '2026-10-03T10:00:00', storys,
})
const post = (id: number, image: string | null, content = ''): Post => ({
  id, user: '@ana', content, image, likes: 0, time: '10:00', comments: [],
})

describe('storys (mesmas regras de exibição do site)', () => {
  it('começa no primeiro story ainda não visto', () => {
    expect(primeiroNaoVisto(grupo('pedro', [story(1, true), story(2, false), story(3, false)]))).toBe(1)
    expect(primeiroNaoVisto(grupo('pedro', [story(1, true), story(2, true)]))).toBe(0)
  })

  it('ao ver um story, ele fica visto e o número de não vistos cai (o anel apaga no zero)', () => {
    const lista = [grupo('pedro', [story(1, false), story(2, false)]), grupo('carla', [story(3, false)])]
    const depois = marcarVistoNaLista(lista, 2)
    expect(depois[0].naoVistos).toBe(1)
    expect(depois[0].storys[1].visto).toBe(true)
    expect(depois[1]).toBe(lista[1]) // quem não mudou continua o mesmo objeto
    expect(marcarVistoNaLista(depois, 1)[0].naoVistos).toBe(0)
  })

  it('o meu grupo aparece como "Seu story", mas com o meu nome na inicial do avatar', () => {
    const g = grupoParaVisor(grupo('ana', [story(7, true, { visualizacoes: 3 })], true))
    expect(g).toMatchObject({ titulo: 'Seu story', nome: 'ana', meu: true })
    expect(g.itens[0]).toMatchObject({ tipo: 'story', id: 7, visualizacoes: 3 })
  })
})

describe('destaques', () => {
  it('cada ícone guardado pela API tem um desenho; desconhecido vira estrela', () => {
    expect(ICONES_DESTAQUE).toHaveLength(8)
    expect(iconeDoDestaque('tartaruga')).toBe('tartaruga')
    expect(iconeDoDestaque('lixo')).toBe('trash')
    expect(iconeDoDestaque('foguete')).toBe('estrela')
  })

  it('o destaque vira um grupo do visor com os itens já vistos', () => {
    const g = destaqueParaVisor({
      id: 4, nome: 'Praias', icone: 'onda', capa: null,
      itens: [{ tipo: 'post', id: 9, imagem: null, texto: 'Só texto', created_at: null }],
    }, true)
    expect(g).toMatchObject({ chave: '4', titulo: 'Praias', icone: 'waves', meu: true })
    expect(g.itens[0]).toMatchObject({ tipo: 'post', id: 9, visto: true })
  })

  it('opções do destaque: storys no ar (mais novos primeiro), os já guardados e os posts, sem repetir', () => {
    const opcoes = opcoesDoDestaque(
      [story(1, true), story(2, true)],
      [{ tipo: 'story', id: 2, imagem: null, texto: null, created_at: null }, { tipo: 'story', id: 5, imagem: 'x', texto: null, created_at: null }],
      [post(10, 'foto'), post(11, null, 'texto')],
    )
    expect(opcoes.map(o => `${o.tipo}-${o.id}`)).toEqual(['story-2', 'story-1', 'story-5', 'post-10', 'post-11'])
  })

  it('a cor do quadrado de texto é sempre a mesma para o mesmo post', () => {
    expect(corDoPostTexto(11)).toEqual(corDoPostTexto(11))
    expect(corDoPostTexto(11)).not.toEqual(corDoPostTexto(12))
  })
})

describe('link de perfil (o mesmo do site)', () => {
  it('compartilhar perfil monta /usuario/{nome}', () => {
    expect(caminhos.perfil('ana.marinha')).toBe('/usuario/ana.marinha')
    expect(alvos.perfil('@ana.marinha')).toMatchObject({ caminho: '/usuario/ana.marinha', titulo: 'Perfil de @ana.marinha' })
  })
  it('o link de perfil abre a tela do usuário no app', () => {
    expect(lerLinkAquaSite(`${SITE_URL}/usuario/ana.marinha`)).toEqual({ tela: 'Usuario', username: 'ana.marinha', rotulo: 'Abrir perfil' })
  })
})
