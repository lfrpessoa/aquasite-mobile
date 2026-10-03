/**
 * Todas as chamadas à API do AquaSite usadas pelo app — os MESMOS endpoints que o site usa.
 * Nenhuma regra de negócio fica aqui: validações, permissões e contagens são feitas pelo backend.
 */
import { ErroApi, requisitar } from './http'
import { POSTS_POR_PAGINA } from '../config/ambiente'
import type {
  AdminAvisoPraia, AdminDenuncia, AdminPost, AdminUsuario, AvisoPraia, Comunidade, NovoAvisoPraia,
  Conversa, EscopoApagar, Especie, FeedComunidade, Membro, Mensagem, MinhasSolicitacoes, NovaComunidade,
  NovaDenuncia, NovaEspecie, NovaOng, Notificacao, Ong, PerfilStats, PessoaLista, Post, RespostaComentarioComunidade,
  RespostaCurtida, RespostaCurtidaComunidade, RespostaDenuncia, RespostaLogin, RespostaParticipar, RespostaPedidos,
  RespostaSenhaTemporaria, RespostaSimples, RespostaVisibilidade, ResultadoBusca, StatusDenuncia, StatusPedido,
  TipoGrupo, Visibilidade, ComentarioPost, Destaque, GrupoStorys, NovoDestaque, PessoaQueViu, Story, TipoItemDestaque,
} from '../types/api'

const u = encodeURIComponent

// ---------- Contas (/api/users) ----------

export const contas = {
  entrar: (login: string, password: string) =>
    requisitar<RespostaLogin>('/api/users/login', { metodo: 'POST', corpo: { login, password }, autenticar: false }),

  cadastrar: (dados: { username: string; email: string; password: string; bio?: string; avatar?: string | null }) =>
    requisitar<RespostaLogin>('/api/users/register', { metodo: 'POST', corpo: dados, autenticar: false }),

  perfil: (username: string) => requisitar<PerfilStats>(`/api/users/${u(username)}/stats`),

  postsDe: (username: string) => requisitar<Post[]>(`/api/users/${u(username)}/posts`),

  seguidores: (username: string) => requisitar<PessoaLista[]>(`/api/users/${u(username)}/seguidores`),
  seguindo: (username: string) => requisitar<PessoaLista[]>(`/api/users/${u(username)}/seguindo`),

  sigo: (username: string, eu: string) =>
    requisitar<{ following: boolean }>(`/api/users/${u(username)}/follow-status?viewer=${u(eu)}`),
  seguir: (username: string) => requisitar<RespostaSimples>(`/api/users/${u(username)}/follow`, { metodo: 'POST' }),
  deixarDeSeguir: (username: string) =>
    requisitar<RespostaSimples>(`/api/users/${u(username)}/follow`, { metodo: 'DELETE' }),

  alterarBio: (username: string, bio: string) =>
    requisitar<RespostaSimples>(`/api/users/${u(username)}/bio`, { metodo: 'PUT', corpo: { bio } }),
  /** avatar = data URL da imagem, ou '' para remover a foto */
  alterarFoto: (username: string, avatar: string) =>
    requisitar<RespostaSimples>(`/api/users/${u(username)}/avatar`, { metodo: 'PUT', corpo: { avatar } }),
  renomear: (newUsername: string) =>
    requisitar<RespostaSimples & { newUsername?: string; token?: string }>('/api/users/username', {
      metodo: 'PUT', corpo: { newUsername },
    }),
  /** "Esqueci minha senha": manda por e-mail o link para criar uma senha nova (resposta igual exista a conta ou não). */
  esqueciSenha: (login: string) =>
    requisitar<RespostaSimples & { mensagem?: string }>('/api/users/esqueci-senha', { metodo: 'POST', corpo: { login }, autenticar: false }),
  trocarSenha: (atual: string, nova: string) =>
    requisitar<RespostaSimples>('/api/users/senha', { metodo: 'PUT', corpo: { atual, nova } }),

  online: (username: string) => requisitar<void>(`/api/users/${u(username)}/heartbeat`, { metodo: 'POST' }),
}

// ---------- Feed (/api/posts) ----------

export const feed = {
  /** Uma página do feed; antesDe = id do último post já exibido. */
  pagina: (antesDe?: number) =>
    requisitar<Post[]>(`/api/posts?limite=${POSTS_POR_PAGINA}${antesDe ? `&antesDe=${antesDe}` : ''}`),
  publicar: (content: string, image: string | null) =>
    requisitar<Post & RespostaSimples>('/api/posts', { metodo: 'POST', corpo: { content, image } }),
  /** Um post só (tela de detalhe, aberta pelas notificações e pelo push). */
  obter: async (id: number): Promise<Post> => {
    const r = await requisitar<Post | RespostaSimples>(`/api/posts/${id}`)
    // a API responde 404 com { success: false } quando o post foi apagado (ou está oculto para quem vê)
    if ('success' in r && r.success === false) throw new ErroApi(r.error ?? 'Post não encontrado.', 404)
    return r as Post
  },
  curtir: (id: number) => requisitar<RespostaCurtida>(`/api/posts/${id}/like`, { metodo: 'POST' }),
  descurtir: (id: number) => requisitar<RespostaCurtida>(`/api/posts/${id}/like`, { metodo: 'DELETE' }),
  comentar: (id: number, text: string) =>
    requisitar<ComentarioPost>(`/api/posts/${id}/comments`, { metodo: 'POST', corpo: { text } }),
  apagar: (id: number) => requisitar<RespostaSimples>(`/api/posts/${id}`, { metodo: 'DELETE' }),
}

/** Espécies cadastradas pelos administradores (GET /api/especies, rota pública; o site usa a mesma tabela). */
export const especies = {
  listar: () => requisitar<Especie[]>('/api/especies', { autenticar: false }),
}

export const busca = {
  pesquisar: (q: string) => requisitar<ResultadoBusca>(`/api/search?q=${u(q)}`),
}

// ---------- Mensagens (/api/messages) ----------

export const mensagens = {
  conversas: (eu: string) => requisitar<Conversa[]>(`/api/messages/conversations/${u(eu)}`),
  conversa: (eu: string, outro: string) => requisitar<Mensagem[]>(`/api/messages/${u(eu)}/${u(outro)}`),
  enviar: (receiver: string, content: string, image: string | null) =>
    requisitar<Mensagem>('/api/messages', { metodo: 'POST', corpo: { receiver, content, image } }),
  apagar: (id: number, scope: EscopoApagar) =>
    requisitar<RespostaSimples>(`/api/messages/${id}?scope=${scope}`, { metodo: 'DELETE' }),
}

// ---------- Notificações (/api/notifications) ----------

export const notificacoes = {
  listar: (eu: string) => requisitar<Notificacao[]>(`/api/notifications/${u(eu)}`),
  naoLidas: (eu: string) => requisitar<{ count: number }>(`/api/notifications/${u(eu)}/unread-count`),
  marcarLidas: (eu: string) => requisitar<RespostaSimples>(`/api/notifications/${u(eu)}/read`, { metodo: 'PUT' }),
}

// ---------- Avisos de praia e denúncias ----------

export const praias = {
  avisos: (praia: string) => requisitar<AvisoPraia[]>(`/api/beach-reports?praia=${u(praia)}`, { autenticar: false }),
  /** foto (data URL) e latitude/longitude são opcionais */
  avisar: (dados: NovoAvisoPraia) =>
    requisitar<RespostaSimples>('/api/beach-reports', { metodo: 'POST', corpo: dados }),
}

export const denuncias = {
  enviar: (d: NovaDenuncia) => requisitar<RespostaDenuncia>('/api/denuncias', { metodo: 'POST', corpo: d }),
}

// ---------- Comunidade (/api/comunidade) ----------

export const comunidade = {
  ongs: () => requisitar<Ong[]>('/api/comunidade/ongs'),
  comunidades: () => requisitar<Comunidade[]>('/api/comunidade/comunidades'),
  membros: (tipo: TipoGrupo, id: number) => requisitar<Membro[]>(`/api/comunidade/${tipo}/${id}/membros`),
  participar: (tipo: TipoGrupo, id: number) =>
    requisitar<RespostaParticipar>(`/api/comunidade/${tipo}/${id}/participar`, { metodo: 'POST' }),
  sair: (tipo: TipoGrupo, id: number) =>
    requisitar<RespostaParticipar>(`/api/comunidade/${tipo}/${id}/participar`, { metodo: 'DELETE' }),
  pedidos: (id: number) => requisitar<RespostaPedidos>(`/api/comunidade/comunidade/${id}/pedidos`),
  aceitar: (id: number, username: string) =>
    requisitar<RespostaParticipar>(`/api/comunidade/comunidade/${id}/pedidos/${u(username)}/aceitar`, { metodo: 'POST' }),
  recusar: (id: number, username: string) =>
    requisitar<RespostaSimples>(`/api/comunidade/comunidade/${id}/pedidos/${u(username)}`, { metodo: 'DELETE' }),
  removerMembro: (id: number, username: string) =>
    requisitar<RespostaParticipar>(`/api/comunidade/comunidade/${id}/membros/${u(username)}`, { metodo: 'DELETE' }),
  visibilidade: (id: number, visibilidade: Visibilidade) =>
    requisitar<RespostaVisibilidade>(`/api/comunidade/comunidade/${id}/visibilidade`, {
      metodo: 'PATCH', corpo: { visibilidade },
    }),
  solicitarComunidade: (d: NovaComunidade) =>
    requisitar<RespostaSimples & { id?: number }>('/api/comunidade/comunidades', { metodo: 'POST', corpo: d }),
  sugerirOng: (d: NovaOng) =>
    requisitar<RespostaSimples & { id?: number }>('/api/comunidade/ongs', { metodo: 'POST', corpo: d }),
  minhasSolicitacoes: () => requisitar<MinhasSolicitacoes>('/api/comunidade/minhas-solicitacoes'),

  // feed de uma comunidade ou ONG
  feed: (tipo: TipoGrupo, id: number) => requisitar<FeedComunidade>(`/api/comunidade/${tipo}/${id}/posts`),
  publicar: (tipo: TipoGrupo, id: number, conteudo: string, imagem: string | null) =>
    requisitar<RespostaSimples & { id?: number }>(`/api/comunidade/${tipo}/${id}/posts`, {
      metodo: 'POST', corpo: { conteudo, imagem },
    }),
  curtir: (postId: number) =>
    requisitar<RespostaCurtidaComunidade>(`/api/comunidade/feed/posts/${postId}/curtir`, { metodo: 'POST' }),
  comentar: (postId: number, texto: string) =>
    requisitar<RespostaComentarioComunidade>(`/api/comunidade/feed/posts/${postId}/comentarios`, {
      metodo: 'POST', corpo: { texto },
    }),
  apagarPost: (postId: number) =>
    requisitar<RespostaSimples>(`/api/comunidade/feed/posts/${postId}`, { metodo: 'DELETE' }),
  apagarComentario: (id: number) =>
    requisitar<RespostaSimples>(`/api/comunidade/feed/comentarios/${id}`, { metodo: 'DELETE' }),
}

// ---------- Painel admin (/api/admin, só para o papel ADMIN) ----------

export const admin = {
  usuarios: () => requisitar<AdminUsuario[]>('/api/admin/usuarios'),
  excluirUsuario: (username: string) =>
    requisitar<RespostaSimples>(`/api/admin/usuarios/${u(username)}`, { metodo: 'DELETE' }),
  senhaTemporaria: (username: string) =>
    requisitar<RespostaSenhaTemporaria>(`/api/admin/usuarios/${u(username)}/senha-temporaria`, { metodo: 'POST' }),

  posts: () => requisitar<AdminPost[]>('/api/admin/posts'),
  excluirPost: (id: number) => requisitar<RespostaSimples>(`/api/admin/posts/${id}`, { metodo: 'DELETE' }),
  ocultarPost: (id: number, oculto: boolean) =>
    requisitar<RespostaSimples>(`/api/admin/posts/${id}/oculto`, { metodo: 'PATCH', corpo: { oculto } }),

  especies: () => requisitar<Especie[]>('/api/especies'),
  criarEspecie: (e: NovaEspecie) => requisitar<Especie>('/api/admin/especies', { metodo: 'POST', corpo: e }),
  editarEspecie: (id: number, e: NovaEspecie) =>
    requisitar<RespostaSimples>(`/api/admin/especies/${id}`, { metodo: 'PUT', corpo: e }),
  excluirEspecie: (id: number) => requisitar<RespostaSimples>(`/api/admin/especies/${id}`, { metodo: 'DELETE' }),

  avisosPraia: () => requisitar<AdminAvisoPraia[]>('/api/admin/beach-reports'),
  statusAviso: (id: number, status: StatusDenuncia) =>
    requisitar<RespostaSimples>(`/api/admin/beach-reports/${id}/status`, { metodo: 'PATCH', corpo: { status } }),

  denuncias: () => requisitar<AdminDenuncia[]>('/api/admin/denuncias'),
  statusDenuncia: (id: number, status: StatusDenuncia) =>
    requisitar<RespostaSimples>(`/api/admin/denuncias/${id}/status`, { metodo: 'PATCH', corpo: { status } }),

  ongs: () => requisitar<Ong[]>('/api/admin/ongs'),
  comunidades: () => requisitar<Comunidade[]>('/api/admin/comunidades'),
  criarOng: (d: NovaOng) => requisitar<RespostaSimples>('/api/admin/ongs', { metodo: 'POST', corpo: d }),
  statusGrupo: (tipo: 'ongs' | 'comunidades', id: number, status: StatusPedido) =>
    requisitar<RespostaSimples>(`/api/admin/${tipo}/${id}/status`, { metodo: 'PATCH', corpo: { status } }),
  excluirGrupo: (tipo: 'ongs' | 'comunidades', id: number) =>
    requisitar<RespostaSimples>(`/api/admin/${tipo}/${id}`, { metodo: 'DELETE' }),
}

// ---------- Storys e destaques (os mesmos endpoints do site) ----------

/** A API responde 400/403 com { success: false, error }: aqui isso vira um erro com a mensagem dela. */
async function exigirSucesso<T extends object>(promessa: Promise<T>): Promise<T> {
  const r = await promessa
  if (r && 'success' in r && (r as RespostaSimples).success === false) {
    throw new ErroApi((r as RespostaSimples).error ?? 'Não foi possível concluir agora.', 400)
  }
  return r
}

export const storys = {
  /** os storys no ar de quem eu sigo e os meus, agrupados por pessoa */
  listar: () => requisitar<GrupoStorys[]>('/api/storys'),
  /** quantos storys de quem eu sigo eu ainda não vi */
  novos: () => requisitar<{ novos: number }>('/api/storys/novos'),
  meus: () => requisitar<Story[]>('/api/storys/meus'),
  /** imagem = data URL (já reduzida); texto opcional, até 150 caracteres */
  publicar: async (imagem: string, texto: string) =>
    (await exigirSucesso(requisitar<RespostaSimples & { story: Story }>('/api/storys', { metodo: 'POST', corpo: { imagem, texto } }))).story,
  marcarVisto: (id: number) => requisitar<RespostaSimples>(`/api/storys/${id}/visto`, { metodo: 'POST' }),
  quemViu: (id: number) =>
    exigirSucesso(requisitar<RespostaSimples & { total: number; pessoas: PessoaQueViu[] }>(`/api/storys/${id}/visualizacoes`)),
  apagar: (id: number) => exigirSucesso(requisitar<RespostaSimples>(`/api/storys/${id}`, { metodo: 'DELETE' })),
}

export const destaques = {
  doPerfil: (username: string) => requisitar<Destaque[]>(`/api/users/${u(username)}/destaques`),
  criar: (d: NovoDestaque) => exigirSucesso(requisitar<RespostaSimples & { id: number }>('/api/destaques', { metodo: 'POST', corpo: d })),
  editar: (id: number, d: NovoDestaque) =>
    exigirSucesso(requisitar<RespostaSimples>(`/api/destaques/${id}`, { metodo: 'PUT', corpo: d })),
  apagar: (id: number) => exigirSucesso(requisitar<RespostaSimples>(`/api/destaques/${id}`, { metodo: 'DELETE' })),
  adicionar: (id: number, tipo: TipoItemDestaque, alvoId: number) =>
    exigirSucesso(requisitar<RespostaSimples>(`/api/destaques/${id}/itens`, { metodo: 'POST', corpo: { tipo, id: alvoId } })),
}

/** Fixar (ou desafixar) um post no topo do perfil. */
export const fixarPost = (id: number, fixado: boolean) =>
  exigirSucesso(requisitar<RespostaSimples>(`/api/posts/${id}/fixado`, { metodo: 'PUT', corpo: { fixado } }))
