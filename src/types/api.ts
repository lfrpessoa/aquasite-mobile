/**
 * Formato dos dados que a API do AquaSite devolve (os mesmos que o site recebe).
 * Os nomes dos campos seguem exatamente o JSON do backend Spring Boot.
 */

export type Papel = 'USER' | 'ADMIN'

/** Resposta padrão de ações: { success: true, ... } ou { success: false, error }. */
export interface RespostaSimples {
  success: boolean
  error?: string
}

// ---------- Contas ----------

export interface UsuarioSessao {
  username: string
  email: string
  role: Papel
}

export interface RespostaLogin extends RespostaSimples {
  token?: string
  /** true quando a pessoa entrou com uma senha temporária gerada pelo admin */
  trocarSenha?: boolean
  user?: UsuarioSessao
}

export interface Sessao {
  token: string
  usuario: UsuarioSessao
}

export interface PerfilStats {
  postsCount: number
  followersCount: number
  followingCount: number
  /** só vem quando quem pede é o próprio dono do perfil */
  email?: string
  bio: string
  avatar: string | null
  joinDate: string
  online: boolean
  error?: string
}

export interface PessoaLista {
  username: string
  avatar: string | null
  bio: string
  online: boolean
  euSigo: boolean
}

// ---------- Feed ----------

export interface ComentarioPost {
  id: number
  user: string
  text: string
}

export interface Post {
  id: number
  /** vem com @ na frente, ex.: "@marina.alves" */
  user: string
  content: string
  image: string | null
  likes: number
  curtiu?: boolean
  /** só a hora ("14:05"); use quandoPostou() para mostrar */
  time: string
  /** data e hora completas (posts antigos não têm) */
  created_at?: string | null
  oculto?: boolean
  comments: ComentarioPost[]
}

export interface RespostaCurtida {
  likes: number
  curtiu?: boolean
  alreadyLiked?: boolean
  success?: boolean
  error?: string
}

// ---------- Busca ----------

export interface UsuarioBusca {
  username: string
  bio: string | null
  avatar: string | null
  online?: boolean
}

export type PostBusca = Omit<Post, 'comments' | 'curtiu'>

export interface ResultadoBusca {
  users: UsuarioBusca[]
  posts: PostBusca[]
}

// ---------- Mensagens ----------

export interface Conversa {
  other_user: string
  last_time: string | null
  last_message: string | null
  avatar: string | null
  online: boolean
}

export interface Mensagem {
  id: number
  sender: string
  receiver: string
  content: string | null
  image: string | null
  createdAt?: string
  created_at?: string
  isRead?: boolean
  deletedForAll?: boolean
}

export type EscopoApagar = 'me' | 'all'

// ---------- Notificações ----------

export type TipoNotificacao =
  | 'like' | 'comment' | 'follow' | 'message'
  | 'comunidade' | 'comunidade-pedido' | 'comunidade-aceito'
  | 'moderacao-oculto' | 'moderacao-liberado'

export interface Notificacao {
  id: number
  recipient: string
  sender: string
  type: TipoNotificacao | string
  post_id: number | null
  message: string | null
  is_read: boolean
  created_at: string
  sender_avatar: string | null
}

// ---------- Praias ----------

export type CategoriaAviso = 'poluicao' | 'perigo' | 'fauna' | 'lotacao' | 'outro'

export interface AvisoPraia {
  id: number
  praia: string
  uf: string | null
  categoria: CategoriaAviso
  descricao: string
  usuario: string
  status: string
  created_at: string
  /** URL da foto tirada no local (ou null) */
  foto?: string | null
  latitude?: number | null
  longitude?: number | null
}

export interface NovoAvisoPraia {
  praia: string
  uf?: string
  categoria: CategoriaAviso
  descricao: string
  foto?: string | null
  latitude?: number | null
  longitude?: number | null
}

// ---------- Denúncias ----------

export type MotivoDenuncia = 'spam' | 'conteudo_impropio' | 'assedio' | 'informacao_falsa' | 'outro'

export interface NovaDenuncia {
  tipo: 'post' | 'usuario'
  alvoPostId?: number
  alvoUsuario?: string
  motivo: MotivoDenuncia
  descricao?: string
}

export interface RespostaDenuncia extends RespostaSimples {
  id?: number
  jaDenunciado?: boolean
  ocultado?: boolean
}

// ---------- Comunidade ----------

export type TipoGrupo = 'ong' | 'comunidade'
export type StatusPedido = 'pendente' | 'aprovada' | 'recusada'
export type Visibilidade = 'publica' | 'privada'

export interface Ong {
  id: number
  nome: string
  area: string
  descricao: string
  cidade: string | null
  uf: string | null
  site: string
  status: StatusPedido
  sugeridaPor: string | null
  membros: number
  participando: boolean
  created_at: string | null
}

export interface Comunidade {
  id: number
  nome: string
  tema: string
  visibilidade: Visibilidade | null
  descricao: string
  cidade: string | null
  uf: string | null
  criador: string
  status: StatusPedido
  membros: number
  participando: boolean
  pendente: boolean
  souAdmin?: boolean
  pedidosPendentes?: number
  created_at: string | null
}

export interface Membro {
  username: string
  avatar: string | null
  desde: string | null
  admin?: boolean
}

export interface RespostaPedidos extends RespostaSimples {
  pedidos?: Membro[]
}

export interface RespostaParticipar extends RespostaSimples {
  participando?: boolean
  pendente?: boolean
  membros?: number
}

export interface RespostaVisibilidade extends RespostaSimples {
  visibilidade?: Visibilidade
  pedidosAceitos?: number
}

export interface MinhaSolicitacao {
  id: number
  nome: string
  status: StatusPedido
  created_at: string | null
}

export interface MinhasSolicitacoes {
  ongs: MinhaSolicitacao[]
  comunidades: MinhaSolicitacao[]
}

export interface NovaComunidade {
  nome: string
  tema: string
  descricao: string
  visibilidade: Visibilidade
  cidade?: string
  uf?: string
}

export interface NovaOng {
  nome: string
  area: string
  site: string
  descricao: string
  cidade?: string
  uf?: string
}

export interface ComentarioComunidade {
  id: number
  autor: string
  texto: string
  created_at: string | null
  podeApagar: boolean
}

export interface PostComunidade {
  id: number
  autor: string
  autorAdmin: boolean
  avatar: string | null
  conteudo: string
  imagem: string | null
  created_at: string | null
  curtidas: number
  curtiu: boolean
  comentarios: ComentarioComunidade[]
  podeApagar: boolean
}

export interface FeedComunidade extends RespostaSimples {
  posts?: PostComunidade[]
  podePublicar?: boolean
}

export interface RespostaCurtidaComunidade extends RespostaSimples {
  curtiu?: boolean
  curtidas?: number
}

export interface RespostaComentarioComunidade extends RespostaSimples {
  comentario?: ComentarioComunidade
}

// ---------- Espécies e admin ----------

export interface Especie {
  id: number
  nome: string
  nomeCientifico: string | null
  categoria: string | null
  descricao: string | null
  imagem: string | null
  habitat: string | null
}

export type NovaEspecie = Omit<Especie, 'id'>

export interface AdminUsuario {
  id: number
  username: string
  email: string
  role: Papel
  createdAt: string | null
}

export interface AdminPost {
  id: number
  user: string
  content: string
  likes: number
  time: string
  oculto: boolean
  temImagem: boolean
}

export type StatusDenuncia = 'pendente' | 'revisado' | 'resolvido'

export interface AdminAvisoPraia extends AvisoPraia {
  status: StatusDenuncia
}

export interface AdminDenuncia {
  id: number
  tipo: 'post' | 'usuario'
  alvoPostId: number | null
  alvoUsuario: string | null
  motivo: MotivoDenuncia
  descricao: string | null
  denunciante: string
  status: StatusDenuncia
  created_at: string | null
}


export interface RespostaSenhaTemporaria extends RespostaSimples {
  senhaTemporaria?: string
}
