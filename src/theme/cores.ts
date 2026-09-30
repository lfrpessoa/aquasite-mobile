/**
 * Paletas do app (as mesmas cores dos temas do site) e as preferências de aparência.
 *
 * `cores` é um objeto único que todas as telas leem ao carregar. O App aplica a paleta escolhida
 * ANTES de carregar as telas (ver App.tsx); trocar o tema salva a escolha e reinicia o app.
 */
export interface Paleta {
  fundo: string
  fundo2: string
  fundo3: string
  painel: string
  painelClaro: string
  borda: string
  bordaForte: string
  texto: string
  textoSuave: string
  textoApagado: string
  destaque: string
  destaqueFundo: string
  destaqueEscuro: string
  ok: string
  erro: string
  erroFundo: string
  atencao: string
  atencaoFundo: string
  curtida: string
  branco: string
}

const ESCURO: Paleta = {
  fundo: '#020e1e', fundo2: '#011628', fundo3: '#012233', painel: '#001630', painelClaro: '#0a2440',
  borda: 'rgba(255,255,255,0.10)', bordaForte: 'rgba(255,255,255,0.22)',
  texto: '#f0f9ff', textoSuave: '#c8e6f0', textoApagado: '#8aa8b8',
  destaque: '#00d4ff', destaqueFundo: 'rgba(0,212,255,0.12)', destaqueEscuro: '#0077b6',
  ok: '#4ecdc4', erro: '#ff6b6b', erroFundo: 'rgba(255,107,107,0.12)',
  atencao: '#ffa726', atencaoFundo: 'rgba(255,167,38,0.14)', curtida: '#ff6b9d', branco: '#ffffff',
}

/** Tema claro do site (theme.css, data-theme="light"). */
const CLARO: Paleta = {
  fundo: '#ecf4f9', fundo2: '#e4f0f7', fundo3: '#daeaf4', painel: '#f8fbfd', painelClaro: '#ffffff',
  borda: 'rgba(0,60,100,0.14)', bordaForte: 'rgba(0,60,100,0.30)',
  texto: '#082642', textoSuave: '#2d5573', textoApagado: '#557189',
  destaque: '#0079a8', destaqueFundo: 'rgba(0,121,168,0.10)', destaqueEscuro: '#0077b6',
  ok: '#0f7d74', erro: '#c83232', erroFundo: 'rgba(200,50,50,0.10)',
  atencao: '#a85d00', atencaoFundo: 'rgba(255,167,38,0.18)', curtida: '#c2255c', branco: '#ffffff',
}

/** Alto contraste sobre fundo escuro: texto branco puro, bordas fortes. */
const CONTRASTE_ESCURO: Paleta = {
  ...ESCURO,
  fundo: '#000000', fundo2: '#000000', fundo3: '#0a0a0a', painel: '#000000', painelClaro: '#111111',
  borda: 'rgba(255,255,255,0.75)', bordaForte: '#ffffff',
  texto: '#ffffff', textoSuave: '#ffffff', textoApagado: '#e6e6e6',
  destaque: '#66e5ff', destaqueFundo: 'rgba(102,229,255,0.16)', ok: '#6effbe', erro: '#ff8c8c', atencao: '#ffd400',
}

/** Alto contraste sobre fundo claro: texto preto, bordas pretas. */
const CONTRASTE_CLARO: Paleta = {
  ...CLARO,
  fundo: '#ffffff', fundo2: '#ffffff', fundo3: '#f2f2f2', painel: '#ffffff', painelClaro: '#ffffff',
  borda: 'rgba(0,0,0,0.8)', bordaForte: '#000000',
  texto: '#000000', textoSuave: '#000000', textoApagado: '#1a1a1a',
  destaque: '#003c82', destaqueFundo: 'rgba(0,60,130,0.10)', ok: '#00643c', erro: '#aa0000', atencao: '#7a4a00',
}

export type Tema = 'escuro' | 'claro'

export interface Preferencias {
  tema: Tema
  altoContraste: boolean
  menosMovimento: boolean
}

export const PREFERENCIAS_PADRAO: Preferencias = { tema: 'escuro', altoContraste: false, menosMovimento: false }

/** Cores em uso. Todas as telas importam este objeto. */
export const cores: Paleta = { ...ESCURO }

/** Preferências em uso (lidas pelas telas que precisam, ex.: animações e barra de status). */
export const preferencias: Preferencias = { ...PREFERENCIAS_PADRAO }

export function paletaPara(p: Preferencias): Paleta {
  if (p.tema === 'claro') return p.altoContraste ? CONTRASTE_CLARO : CLARO
  return p.altoContraste ? CONTRASTE_ESCURO : ESCURO
}

/** Aplica as preferências. Precisa rodar antes de as telas serem carregadas. */
export function aplicarPreferencias(p: Preferencias): void {
  Object.assign(preferencias, p)
  Object.assign(cores, paletaPara(p))
}
