// Textos e listas fixas que o site também mantém no próprio front-end (não vêm do banco).
import type { MotivoDenuncia, StatusDenuncia, StatusPedido } from '../types/api'
import type { NomeIcone } from '../components/Icone'

/** Temas da Comunidade — a mesma lista validada no backend (ComunidadeService.TEMAS). */
export const TEMAS: { valor: string; label: string }[] = [
  { valor: 'tartarugas', label: 'Tartarugas' },
  { valor: 'baleias-golfinhos', label: 'Baleias e golfinhos' },
  { valor: 'corais', label: 'Corais' },
  { valor: 'aves-marinhas', label: 'Aves marinhas' },
  { valor: 'peixes', label: 'Peixes' },
  { valor: 'resgate', label: 'Resgate de animais' },
  { valor: 'lixo-no-mar', label: 'Lixo no mar' },
  { valor: 'limpeza-de-praia', label: 'Limpeza de praia' },
  { valor: 'mergulho', label: 'Mergulho' },
  { valor: 'educacao', label: 'Educação ambiental' },
  { valor: 'politicas', label: 'Políticas públicas' },
  { valor: 'costa', label: 'Costa e mar' },
  { valor: 'outro', label: 'Outro' },
]

export const temaLabel = (valor: string | null | undefined): string =>
  TEMAS.find(t => t.valor === valor)?.label ?? valor ?? ''

export const STATUS_PEDIDO: Record<StatusPedido, { texto: string; icone: NomeIcone }> = {
  pendente: { texto: 'Aguardando análise', icone: 'alert' },
  aprovada: { texto: 'Aprovada', icone: 'check' },
  recusada: { texto: 'Não aprovada', icone: 'x' },
}

export const STATUS_DENUNCIA: StatusDenuncia[] = ['pendente', 'revisado', 'resolvido']

export const MOTIVOS: { valor: MotivoDenuncia; label: string }[] = [
  { valor: 'spam', label: 'Spam' },
  { valor: 'conteudo_impropio', label: 'Conteúdo impróprio' },
  { valor: 'assedio', label: 'Assédio / bullying' },
  { valor: 'informacao_falsa', label: 'Informação falsa' },
  { valor: 'outro', label: 'Outro' },
]

export const motivoLabel = (v: string): string => MOTIVOS.find(m => m.valor === v)?.label ?? v

export const localTexto = (item: { cidade?: string | null; uf?: string | null }): string =>
  [item.cidade, item.uf].filter(Boolean).join(' - ')

// ---------- Curiosidades ----------

export const POR_QUE_PRESERVAR: { titulo: string; texto: string }[] = [
  { titulo: 'Biodiversidade', texto: 'Milhares de espécies dependem de um oceano saudável para viver.' },
  { titulo: 'Clima', texto: 'Os oceanos regulam o clima e produzem grande parte do oxigênio que respiramos.' },
  { titulo: 'Alimentação', texto: 'Milhões de pessoas dependem dos oceanos como fonte de alimento e sustento.' },
  { titulo: 'Futuro', texto: 'Preservar os oceanos é garantir um planeta saudável para as próximas gerações.' },
]

export interface Dica {
  titulo: string
  texto: string
  porQue: string
  comoAjudar: string
}

export const DICAS: Dica[] = [
  {
    titulo: 'Reduza o plástico', texto: 'Evite produtos descartáveis e dê preferência a itens reutilizáveis.',
    porQue: 'O plástico é um dos maiores poluentes dos oceanos. Muitos animais marinhos confundem resíduos plásticos com alimento, causando ferimentos e até a morte. Menos plástico nos oceanos significa mais segurança para tartarugas, peixes, aves marinhas e outros animais.',
    comoAjudar: 'Utilize garrafas reutilizáveis, evite canudos e copos descartáveis, leve sua própria sacola para compras e prefira produtos com menos embalagens plásticas. A reciclagem reduz a poluição e ajuda a preservar os recursos naturais do planeta.',
  },
  {
    titulo: 'Recicle sempre', texto: 'Separe corretamente os resíduos recicláveis.',
    porQue: 'Grande parte dos resíduos que chegam aos oceanos poderia ser reciclada. A reciclagem reduz a quantidade de lixo descartado de forma inadequada.',
    comoAjudar: 'Separe papel, plástico, vidro e metal, utilize pontos de coleta seletiva da sua cidade, lave embalagens antes de descartá-las e incentive familiares e amigos a reciclar.',
  },
  {
    titulo: 'Economize água', texto: 'Usar água com consciência reduz o impacto sobre os recursos hídricos.',
    porQue: 'A água é um recurso essencial para toda a vida na Terra. O desperdício aumenta a pressão sobre rios, lagos e ecossistemas que se conectam aos oceanos. A preservação da água contribui para o equilíbrio ambiental e para a saúde dos ecossistemas marinhos.',
    comoAjudar: 'Feche a torneira ao escovar os dentes, tome banhos mais curtos, conserte vazamentos e reutilize água sempre que possível.',
  },
  {
    titulo: 'Consumo consciente', texto: 'Prefira marcas sustentáveis que respeitam o meio ambiente.',
    porQue: 'Nossas escolhas de compra influenciam diretamente o meio ambiente. Empresas sustentáveis ajudam a reduzir impactos negativos nos oceanos. O consumo responsável incentiva práticas mais sustentáveis em toda a cadeia produtiva.',
    comoAjudar: 'Compre apenas o necessário, escolha produtos sustentáveis, prefira marcas comprometidas com o meio ambiente e evite produtos que gerem muito lixo.',
  },
  {
    titulo: 'Participe e apoie', texto: 'Apoie projetos de preservação e participe de ações de limpeza de praias.',
    porQue: 'A preservação dos oceanos depende da participação da sociedade e do apoio a iniciativas ambientais.',
    comoAjudar: 'Participe de mutirões de limpeza de praias, apoie ONGs ambientais, divulgue campanhas de preservação e contribua como voluntário em projetos locais.',
  },
  {
    titulo: 'Compartilhe informação', texto: 'Fale sobre a importância dos oceanos e inspire mais pessoas a agir.',
    porQue: 'Muitas pessoas ainda desconhecem os impactos da poluição marinha. A informação é uma ferramenta poderosa de transformação. Quanto mais pessoas conscientes, maior será o número de ações positivas em favor dos oceanos.',
    comoAjudar: 'Compartilhe conteúdos educativos, converse com amigos e familiares, divulgue campanhas ambientais nas redes sociais e incentive hábitos sustentáveis.',
  },
]

// ---------- Sobre ----------

export const EQUIPE: { nome: string; papel: string; descricao: string }[] = [
  { nome: 'Guilherme Martins', papel: 'Time Scrum', descricao: 'Integrante da equipe de desenvolvimento do AquaSite.' },
  { nome: 'Julia Souza', papel: 'Product Owner', descricao: 'Responsável por definir as prioridades e a visão do produto.' },
  { nome: 'Luiz Fernando', papel: 'Scrum Master', descricao: 'Facilita o processo Scrum e o trabalho da equipe.' },
  { nome: 'Matheus Ferraz', papel: 'Banco de Dados', descricao: 'Responsável pelo banco de dados e pela integração do sistema.' },
  { nome: 'Miguel Nathan', papel: 'Mobile', descricao: 'Responsável pelo aplicativo mobile e pela responsividade.' },
  { nome: 'Ryan Spila', papel: 'Segurança', descricao: 'Responsável pela segurança e pelo desempenho do sistema.' },
]
