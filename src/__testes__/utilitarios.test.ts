import { forcaDaSenha } from '../utils/senha'
import { diaSemana, duracao, numero, quandoPostou, semArroba, tempoAtras } from '../utils/formatar'
import { PRAIAS, condicaoPorCodigo, distanciaKm, estadoDoMar, nivelUV, pontoCardeal, praiaMaisProxima } from '../utils/praias'
import { temaLabel } from '../data/conteudo'
import { ANIMAIS, GRUPOS } from '../data/animais'

describe('força da senha (guia visual da regra RN02)', () => {
  it('senha forte: 8 a 16 caracteres, letra e número/símbolo', () => {
    const f = forcaDaSenha('Oceano2026!')
    expect(f.forte).toBe(true)
    expect(f.rotulo).toBe('Senha forte')
  })
  it('curta demais', () => {
    const f = forcaDaSenha('abc1')
    expect(f.tamanhoOk).toBe(false)
    expect(f.forte).toBe(false)
  })
  it('sem número ou símbolo é média', () => {
    expect(forcaDaSenha('somenteletras').rotulo).toBe('Senha média')
  })
  it('mais de 16 caracteres não é aceita', () => {
    expect(forcaDaSenha('Abcdefghijklmnop1').tamanhoOk).toBe(false)
  })
})

describe('formatação', () => {
  it('número em pt-BR com casas fixas', () => {
    expect(numero(2.5)).toBe('2,5')
    expect(numero(22.66, 0)).toBe('23')
    expect(numero(null)).toBe('–')
  })
  it('tira o @ dos autores do feed', () => {
    expect(semArroba('@marina.alves')).toBe('marina.alves')
    expect(semArroba('marina.alves')).toBe('marina.alves')
  })
  it('tempo atrás', () => {
    const agora = Date.now()
    expect(tempoAtras(new Date(agora - 30_000).toISOString())).toBe('agora')
    expect(tempoAtras(new Date(agora - 5 * 60_000).toISOString())).toBe('5min')
    expect(tempoAtras(new Date(agora - 3 * 3_600_000).toISOString())).toBe('3h')
    expect(tempoAtras(new Date(agora - 2 * 86_400_000).toISOString())).toBe('2d')
    expect(tempoAtras(null)).toBe('')
  })
  it('duração da viagem', () => {
    expect(duracao(9)).toBe('9 min')
    expect(duracao(95)).toBe('1h35')
  })
  it('dia da semana', () => {
    expect(diaSemana('2026-10-01')).toBe('qui. 01')
  })
})

describe('praias', () => {
  it('23 praias em destaque (o mesmo número do site)', () => {
    expect(PRAIAS).toHaveLength(23)
  })
  it('distância entre Santos e Guarujá é de poucos km', () => {
    const d = distanciaKm(-23.9718, -46.3298, -23.9931, -46.2564)
    expect(d).toBeGreaterThan(5)
    expect(d).toBeLessThan(10)
  })
  it('praia mais próxima de Barueri é no litoral de SP', () => {
    const { praia } = praiaMaisProxima(-23.5106, -46.8761)
    expect(praia.uf).toBe('SP')
  })
  it('códigos de tempo, direção, UV e estado do mar', () => {
    expect(condicaoPorCodigo(0).texto).toBe('Céu limpo')
    expect(condicaoPorCodigo(95).icone).toBe('cloud-lightning')
    expect(pontoCardeal(90)).toBe('L')
    expect(nivelUV(9)?.texto).toBe('Muito alto')
    expect(estadoDoMar(3)).toBe('Mar agitado, cuidado')
  })
})

describe('conteúdo fixo', () => {
  it('temas da comunidade', () => {
    expect(temaLabel('baleias-golfinhos')).toBe('Baleias e golfinhos')
    expect(temaLabel('inexistente')).toBe('inexistente')
  })
  it('catálogo de animais: 35 espécies, todas num dos 7 grupos, sem nomes repetidos', () => {
    expect(ANIMAIS).toHaveLength(35)
    expect(ANIMAIS.every(a => GRUPOS.includes(a.grupo))).toBe(true)
    expect(new Set(ANIMAIS.map(a => a.nome)).size).toBe(35)
    expect(ANIMAIS.find(a => a.nome === 'Raia-Manta')?.grupo).toBe('Peixe')
  })
})

describe('hora do post', () => {
  it('post novo mostra há quanto tempo foi publicado', () => {
    const haDuasHoras = new Date(Date.now() - 2 * 3600_000 - 60_000)
    const iso = new Date(haDuasHoras.getTime() - haDuasHoras.getTimezoneOffset() * 60_000).toISOString().slice(0, 19) // hora local, sem fuso (como a API manda)
    expect(quandoPostou({ created_at: iso, time: '09:00' })).toBe('2h')
  })
  it('post antigo, sem data completa, mostra a hora', () => {
    expect(quandoPostou({ created_at: null, time: '17:10' })).toBe('17:10')
  })
})
