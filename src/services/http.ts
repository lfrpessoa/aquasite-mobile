import { API_URL } from '../config/ambiente'

/**
 * Cliente HTTP do app: todas as chamadas vão para a MESMA API do site (API_URL),
 * com o mesmo token JWT no cabeçalho Authorization, como faz o site.
 */

type Metodo = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface OpcoesRequisicao {
  metodo?: Metodo
  corpo?: unknown
  /** false = não mandar o token (login, cadastro e rotas públicas) */
  autenticar?: boolean
}

/** Erro de rede ou resposta sem JSON. `status` 0 = sem conexão com a API. */
export class ErroApi extends Error {
  status: number
  constructor(mensagem: string, status: number) {
    super(mensagem)
    this.status = status
  }
}

let tokenAtual: string | null = null
let aoExpirar: (() => void) | null = null

/** Chamado pelo AuthContext ao entrar e sair. */
export function definirToken(token: string | null): void {
  tokenAtual = token
}

/** O AuthContext registra aqui o que fazer quando a API responder 401 (sessão expirada). */
export function aoSessaoExpirar(fn: (() => void) | null): void {
  aoExpirar = fn
}

export function urlDaApi(caminho: string): string {
  return `${API_URL}${caminho.startsWith('/') ? caminho : `/${caminho}`}`
}

/**
 * Faz a requisição e devolve o JSON já tipado.
 * Respostas de erro com JSON (400, 403, 404, 429) também são devolvidas, porque a API
 * explica o problema no campo "error" — as telas mostram essa mensagem.
 */
export async function requisitar<T>(caminho: string, opcoes: OpcoesRequisicao = {}): Promise<T> {
  const { metodo = 'GET', corpo, autenticar = true } = opcoes
  const cabecalhos: Record<string, string> = { Accept: 'application/json' }
  if (corpo !== undefined) cabecalhos['Content-Type'] = 'application/json'
  if (autenticar && tokenAtual) cabecalhos.Authorization = `Bearer ${tokenAtual}`

  let resposta: Response
  try {
    resposta = await fetch(urlDaApi(caminho), {
      method: metodo,
      headers: cabecalhos,
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
    })
  } catch {
    throw new ErroApi(`Sem conexão com a API (${API_URL}). Confira se ela está no ar e se o endereço está certo.`, 0)
  }

  if (resposta.status === 401 && autenticar && tokenAtual) {
    aoExpirar?.()
    throw new ErroApi('Sua sessão expirou. Entre de novo para continuar.', 401)
  }

  const texto = await resposta.text()
  if (!texto) {
    if (resposta.ok) return undefined as T
    throw new ErroApi(mensagemPorStatus(resposta.status), resposta.status)
  }
  try {
    return JSON.parse(texto) as T
  } catch {
    throw new ErroApi(mensagemPorStatus(resposta.status), resposta.status)
  }
}

function mensagemPorStatus(status: number): string {
  if (status === 403) return 'Você não tem permissão para fazer isso.'
  if (status === 404) return 'Não encontrado.'
  if (status === 429) return 'Muitas tentativas. Espere alguns minutos.'
  if (status >= 500) return 'A API teve um problema. Tente de novo em instantes.'
  return `Erro ${status}.`
}

/** Texto amigável para mostrar ao usuário a partir de qualquer erro. */
export function mensagemDeErro(e: unknown): string {
  if (e instanceof ErroApi) return e.message
  if (e instanceof Error) return e.message
  return 'Algo deu errado. Tente de novo.'
}
