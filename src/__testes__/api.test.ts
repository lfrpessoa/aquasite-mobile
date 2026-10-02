import { ErroApi, aoSessaoExpirar, definirToken, mensagemDeErro, requisitar } from '../services/http'
import { comunidade, contas, feed, mensagens, admin } from '../services/api'
import { API_URL } from '../config/ambiente'

// Estes testes conferem que o app chama OS MESMOS endpoints da API do site, com o token certo.
// O fetch é simulado: nenhum teste acessa a API ou o banco de verdade.

interface Chamada { url: string; init: RequestInit }
let chamadas: Chamada[] = []

function responder(status: number, corpo: unknown) {
  global.fetch = jest.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
    chamadas.push({ url: String(url), init: init ?? {} })
    const texto = corpo === undefined ? '' : JSON.stringify(corpo)
    return { ok: status >= 200 && status < 300, status, text: async () => texto } as Response
  }) as jest.Mock
}

const cabecalhos = (c: Chamada) => (c.init.headers ?? {}) as Record<string, string>

beforeEach(() => {
  chamadas = []
  definirToken(null)
  aoSessaoExpirar(null)
})

describe('cliente HTTP', () => {
  it('manda o token JWT no cabeçalho Authorization, como o site', async () => {
    definirToken('abc.def.ghi')
    responder(200, [])
    await requisitar('/api/posts')
    expect(chamadas[0].url).toBe(`${API_URL}/api/posts`)
    expect(cabecalhos(chamadas[0]).Authorization).toBe('Bearer abc.def.ghi')
  })

  it('login e cadastro vão sem token', async () => {
    definirToken('antigo')
    responder(200, { success: true, token: 't', user: { username: 'ana', email: 'a@a.com', role: 'USER' } })
    await contas.entrar('ana', 'Senha123!')
    expect(chamadas[0].url).toBe(`${API_URL}/api/users/login`)
    expect(chamadas[0].init.method).toBe('POST')
    expect(cabecalhos(chamadas[0]).Authorization).toBeUndefined()
    expect(JSON.parse(String(chamadas[0].init.body))).toEqual({ login: 'ana', password: 'Senha123!' })
  })

  it('resposta 401 com token = sessão expirada (volta para o login)', async () => {
    const expirou = jest.fn()
    aoSessaoExpirar(expirou)
    definirToken('vencido')
    responder(401, { error: 'expirado' })
    await expect(requisitar('/api/posts')).rejects.toBeInstanceOf(ErroApi)
    expect(expirou).toHaveBeenCalledTimes(1)
  })

  it('erros da API com mensagem (400, 403, 429) chegam para a tela mostrar', async () => {
    responder(429, { success: false, error: 'Muitas tentativas de login erradas. Tente de novo em 5 minutos.' })
    const r = await contas.entrar('ana', 'errada')
    expect(r.success).toBe(false)
    expect(r.error).toContain('Muitas tentativas')
  })

  it('sem conexão: erro com status 0 e mensagem clara', async () => {
    global.fetch = jest.fn(async () => { throw new TypeError('Network request failed') }) as jest.Mock
    const erro = await requisitar('/api/posts').catch(e => e)
    expect(erro).toBeInstanceOf(ErroApi)
    expect((erro as ErroApi).status).toBe(0)
    expect(mensagemDeErro(erro)).toContain('Sem conexão com a API')
  })
})

describe('endpoints (os mesmos do site)', () => {
  beforeEach(() => { definirToken('tk'); responder(200, { success: true }) })

  it('feed em páginas de 20, a partir do último post exibido', async () => {
    await feed.pagina()
    await feed.pagina(42)
    expect(chamadas[0].url).toBe(`${API_URL}/api/posts?limite=20`)
    expect(chamadas[1].url).toBe(`${API_URL}/api/posts?limite=20&antesDe=42`)
  })

  it('curtir e descurtir', async () => {
    await feed.curtir(7)
    await feed.descurtir(7)
    expect(chamadas.map(c => `${c.init.method} ${c.url.replace(API_URL, '')}`)).toEqual(['POST /api/posts/7/like', 'DELETE /api/posts/7/like'])
  })

  it('apagar mensagem para todos', async () => {
    await mensagens.apagar(5, 'all')
    expect(chamadas[0].url).toBe(`${API_URL}/api/messages/5?scope=all`)
    expect(chamadas[0].init.method).toBe('DELETE')
  })

  it('nomes com caracteres especiais vão codificados na URL', async () => {
    await contas.perfil('ana maria')
    expect(chamadas[0].url).toBe(`${API_URL}/api/users/ana%20maria/stats`)
  })

  it('participar de ONG e aceitar pedido em comunidade', async () => {
    await comunidade.participar('ong', 3)
    await comunidade.aceitar(9, 'bia')
    expect(chamadas.map(c => `${c.init.method} ${c.url.replace(API_URL, '')}`)).toEqual([
      'POST /api/comunidade/ong/3/participar', 'POST /api/comunidade/comunidade/9/pedidos/bia/aceitar'])
  })

  it('admin: ocultar post e gerar senha temporária', async () => {
    await admin.ocultarPost(11, true)
    expect(chamadas[0].url).toBe(`${API_URL}/api/admin/posts/11/oculto`)
    expect(chamadas[0].init.method).toBe('PATCH')
    expect(JSON.parse(String(chamadas[0].init.body))).toEqual({ oculto: true })
    await admin.senhaTemporaria('ana')
    expect(chamadas[1].url).toBe(`${API_URL}/api/admin/usuarios/ana/senha-temporaria`)
    expect(chamadas[1].init.method).toBe('POST')
  })
})
