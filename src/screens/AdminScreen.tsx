import React, { useState } from 'react'
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { perguntar } from '../utils/perguntar'
import Chips from '../components/Chips'
import Folha from '../components/Folha'
import Campo from '../components/Campo'
import Botao from '../components/Botao'
import { Aviso, Carregando, EstadoVazio } from '../components/Estados'
import { useAuth } from '../contexts/AuthContext'
import { useCarregar } from '../hooks/useCarregar'
import type { Carregamento } from '../hooks/useCarregar'
import { admin } from '../services/api'
import { mensagemDeErro } from '../services/http'
import { STATUS_DENUNCIA, TEMAS, motivoLabel, temaLabel } from '../data/conteudo'
import { categoriaInfo } from '../utils/praias'
import { tempoAtras } from '../utils/formatar'
import type {
  AdminAvisoPraia, AdminDenuncia, AdminPost, AdminUsuario, Comunidade, Especie, NovaEspecie, NovaOng, Ong, StatusDenuncia,
} from '../types/api'
import { base, cores, espaco, raio } from '../theme/tema'

type Aba = 'usuarios' | 'posts' | 'especies' | 'praia' | 'conteudo' | 'comunidade'

const ABAS: { valor: Aba; label: string }[] = [
  { valor: 'usuarios', label: 'Usuários' },
  { valor: 'posts', label: 'Posts' },
  { valor: 'especies', label: 'Espécies' },
  { valor: 'praia', label: 'Denúncias de praia' },
  { valor: 'conteudo', label: 'Denúncias de conteúdo' },
  { valor: 'comunidade', label: 'Comunidade' },
]

/** Painel de administração (as mesmas abas e rotas /api/admin do site). Só aparece para o papel ADMIN. */
const AdminScreen = () => {
  const { ehAdmin } = useAuth()
  const [aba, setAba] = useState<Aba>('usuarios')
  if (!ehAdmin) return <View style={base.tela}><EstadoVazio icone="lock" texto="Só administradores acessam este painel." /></View>
  return (
    <View style={base.tela}>
      <View style={{ padding: espaco.md, borderBottomWidth: 1, borderBottomColor: cores.borda }}>
        <Chips opcoes={ABAS} valor={aba} aoMudar={setAba} rotulo="Aba do painel" />
      </View>
      {aba === 'usuarios' && <AbaUsuarios />}
      {aba === 'posts' && <AbaPosts />}
      {aba === 'especies' && <AbaEspecies />}
      {aba === 'praia' && <AbaStatus<AdminAvisoPraia> tipo="praia" />}
      {aba === 'conteudo' && <AbaStatus<AdminDenuncia> tipo="conteudo" />}
      {aba === 'comunidade' && <AbaComunidade />}
    </View>
  )
}

/** Lista rolável com "puxar para atualizar", erro e carregamento — igual em todas as abas. */
function Lista<T>({ dados, erroExtra, vazio, children }: {
  dados: Carregamento<T[]>; erroExtra?: string | null; vazio: string; children: (itens: T[]) => React.ReactNode
}) {
  if (dados.carregando && !dados.dados) return <Carregando />
  return (
    <ScrollView contentContainerStyle={estilos.lista}
      refreshControl={<RefreshControl refreshing={false} onRefresh={() => void dados.recarregar(true)} tintColor={cores.destaque} colors={[cores.destaque]} />}>
      <Aviso tipo="erro" texto={dados.erro ?? erroExtra} />
      {dados.dados?.length === 0 && <Text style={base.textoSuave}>{vazio}</Text>}
      {dados.dados && children(dados.dados)}
    </ScrollView>
  )
}

const confirmar = (titulo: string, texto: string, acao: () => void, botao = 'Confirmar') =>
  perguntar(titulo, texto, [{ text: 'Cancelar', style: 'cancel' }, { text: botao, style: 'destructive', onPress: acao }])

const AbaUsuarios = () => {
  const dados = useCarregar<AdminUsuario[]>(admin.usuarios, [])
  const [erro, setErro] = useState<string | null>(null)

  const excluir = (u: string) => confirmar('Excluir usuário', `Excluir @${u} e tudo o que é dele? Comunidades que ele criou passam para o membro mais antigo (ou são apagadas, se não tiverem membros).`, () => {
    admin.excluirUsuario(u).then(r => (r.success ? dados.recarregar(true) : setErro(r.error ?? 'Não foi possível excluir.')))
      .catch(e => setErro(mensagemDeErro(e)))
  }, 'Excluir')

  return (
    <Lista dados={dados} erroExtra={erro} vazio="Nenhum usuário.">
      {itens => itens.map(u => (
        <View key={u.id} style={estilos.item}>
          <Text style={estilos.titulo}>@{u.username} {u.role === 'ADMIN' && <Text style={estilos.admin}>ADMIN</Text>}</Text>
          <Text style={base.textoSuave}>{u.email}</Text>
          <View style={estilos.acoes}>
            <Botao titulo="Excluir" pequeno variante="perigo" onPress={() => excluir(u.username)} />
          </View>
        </View>
      ))}
    </Lista>
  )
}

const AbaPosts = () => {
  const dados = useCarregar<AdminPost[]>(admin.posts, [])
  const [erro, setErro] = useState<string | null>(null)
  const agir = (p: Promise<{ success: boolean; error?: string }>) =>
    p.then(r => (r.success ? dados.recarregar(true) : setErro(r.error ?? 'Não foi possível.'))).catch(e => setErro(mensagemDeErro(e)))
  return (
    <Lista dados={dados} erroExtra={erro} vazio="Nenhum post.">
      {itens => itens.map(p => (
        <View key={p.id} style={estilos.item}>
          <View style={estilos.linha}>
            <Text style={estilos.titulo}>{p.user}</Text>
            <Text style={{ color: p.oculto ? cores.atencao : cores.ok, fontSize: 12, fontWeight: '700' }}>{p.oculto ? 'Oculto' : 'Visível'}</Text>
          </View>
          <Text style={base.texto} numberOfLines={3}>{p.content || (p.temImagem ? '(só imagem)' : '')}</Text>
          <Text style={base.textoSuave}>♥ {p.likes} · {p.time}</Text>
          <View style={estilos.acoes}>
            <Botao titulo={p.oculto ? 'Mostrar' : 'Ocultar'} pequeno variante="secundario" onPress={() => void agir(admin.ocultarPost(p.id, !p.oculto))} />
            <Botao titulo="Excluir" pequeno variante="perigo" onPress={() => confirmar('Excluir post', 'Excluir este post?', () => void agir(admin.excluirPost(p.id)), 'Excluir')} />
          </View>
        </View>
      ))}
    </Lista>
  )
}

const VAZIA: NovaEspecie = { nome: '', nomeCientifico: '', categoria: '', descricao: '', habitat: '', imagem: '' }

const AbaEspecies = () => {
  const dados = useCarregar<Especie[]>(admin.especies, [])
  const [erro, setErro] = useState<string | null>(null)
  const [form, setForm] = useState<(NovaEspecie & { id?: number }) | null>(null)
  const [salvando, setSalvando] = useState(false)

  const salvar = async () => {
    if (!form) return
    if (!form.nome?.trim()) { setErro('Informe o nome.'); return }
    setSalvando(true)
    try {
      const { id, ...campos } = form
      if (id) await admin.editarEspecie(id, campos); else await admin.criarEspecie(campos)
      setForm(null)
      await dados.recarregar(true)
    } catch (e) { setErro(mensagemDeErro(e)) }
    setSalvando(false)
  }

  const campo = (chave: keyof NovaEspecie, rotulo: string, multilinha = false) => (
    <Campo rotulo={rotulo} value={form?.[chave] ?? ''} multiline={multilinha}
      onChangeText={t => setForm(f => (f ? { ...f, [chave]: t } : f))} />
  )

  return (
    <>
      <View style={{ paddingHorizontal: espaco.lg, paddingTop: espaco.md }}>
        <Botao titulo="Nova espécie" icone="fish" pequeno onPress={() => { setErro(null); setForm({ ...VAZIA }) }} />
      </View>
      <Lista dados={dados} erroExtra={erro} vazio="Nenhuma espécie cadastrada.">
        {itens => itens.map(e => (
          <View key={e.id} style={estilos.item}>
            <Text style={estilos.titulo}>{e.nome}</Text>
            <Text style={base.textoSuave}>{[e.nomeCientifico, e.categoria, e.habitat].filter(Boolean).join(' · ')}</Text>
            <View style={estilos.acoes}>
              <Botao titulo="Editar" pequeno variante="secundario" onPress={() => { setErro(null); setForm({ ...e }) }} />
              <Botao titulo="Excluir" pequeno variante="perigo" onPress={() => confirmar('Excluir espécie', `Excluir ${e.nome}?`, () => {
                admin.excluirEspecie(e.id).then(() => dados.recarregar(true)).catch(x => setErro(mensagemDeErro(x)))
              }, 'Excluir')} />
            </View>
          </View>
        ))}
      </Lista>
      <Folha visivel={form !== null} titulo={form?.id ? 'Editar espécie' : 'Nova espécie'} aoFechar={() => setForm(null)}>
        {campo('nome', 'Nome')}
        {campo('nomeCientifico', 'Nome científico')}
        {campo('categoria', 'Categoria (ex.: Peixe, Mamífero)')}
        {campo('habitat', 'Habitat')}
        {campo('descricao', 'Descrição', true)}
        {campo('imagem', 'Endereço da imagem (opcional)')}
        <Aviso tipo="erro" texto={erro} />
        <Botao titulo="Salvar" onPress={salvar} carregando={salvando} />
      </Folha>
    </>
  )
}

/** Denúncias de praia e de conteúdo: mudar o status entre pendente, revisado e resolvido. */
function AbaStatus<T extends AdminAvisoPraia | AdminDenuncia>({ tipo }: { tipo: 'praia' | 'conteudo' }) {
  const dados = useCarregar<T[]>(() => (tipo === 'praia' ? admin.avisosPraia() : admin.denuncias()) as Promise<T[]>, [tipo])
  const [erro, setErro] = useState<string | null>(null)

  const mudar = (id: number, status: StatusDenuncia) => {
    dados.definir(l => l?.map(x => (x.id === id ? { ...x, status } : x)) ?? null)
    const req = tipo === 'praia' ? admin.statusAviso(id, status) : admin.statusDenuncia(id, status)
    req.catch(e => { setErro(mensagemDeErro(e)); void dados.recarregar(true) })
  }

  return (
    <Lista dados={dados} erroExtra={erro} vazio="Nenhuma denúncia.">
      {itens => itens.map(d => (
        <View key={d.id} style={estilos.item}>
          {'praia' in d ? (
            <>
              <Text style={estilos.titulo}>{d.praia}{d.uf ? ` - ${d.uf}` : ''}</Text>
              <Text style={{ color: categoriaInfo(d.categoria).cor, fontWeight: '700', fontSize: 13 }}>{categoriaInfo(d.categoria).label}</Text>
              <Text style={base.texto}>{d.descricao}</Text>
              <Text style={base.textoSuave}>@{d.usuario} · {tempoAtras(d.created_at)}</Text>
            </>
          ) : (
            <>
              <Text style={estilos.titulo}>{d.tipo === 'post' ? `Post #${d.alvoPostId}` : `Usuário @${d.alvoUsuario}`}</Text>
              <Text style={{ color: cores.atencao, fontWeight: '700', fontSize: 13 }}>{motivoLabel(d.motivo)}</Text>
              {!!d.descricao && <Text style={base.texto}>{d.descricao}</Text>}
              <Text style={base.textoSuave}>Denunciado por @{d.denunciante}</Text>
            </>
          )}
          <Chips<StatusDenuncia> opcoes={STATUS_DENUNCIA.map(s => ({ valor: s, label: s }))} valor={d.status}
            aoMudar={s => mudar(d.id, s)} rotulo="Status" />
        </View>
      ))}
    </Lista>
  )
}

type Grupo = (Ong & { tipoAdmin: 'ongs' }) | (Comunidade & { tipoAdmin: 'comunidades' })

const AbaComunidade = () => {
  const dados = useCarregar<Grupo[]>(async () => {
    const [ongs, comunidades] = await Promise.all([admin.ongs(), admin.comunidades()])
    return [...ongs.map(o => ({ ...o, tipoAdmin: 'ongs' as const })), ...comunidades.map(c => ({ ...c, tipoAdmin: 'comunidades' as const }))]
  }, [])
  const [erro, setErro] = useState<string | null>(null)
  const [form, setForm] = useState<NovaOng | null>(null)
  const [salvando, setSalvando] = useState(false)

  const agir = (p: Promise<{ success: boolean; error?: string }>) =>
    p.then(r => (r.success ? dados.recarregar(true) : setErro(r.error ?? 'Não foi possível.'))).catch(e => setErro(mensagemDeErro(e)))

  const criarOng = async () => {
    if (!form) return
    setSalvando(true)
    try {
      const r = await admin.criarOng(form)
      if (!r.success) throw new Error(r.error ?? 'Não foi possível.')
      setForm(null)
      await dados.recarregar(true)
    } catch (e) { setErro(mensagemDeErro(e)) }
    setSalvando(false)
  }

  const ordenados = [...(dados.dados ?? [])].sort((a, b) => (a.status === 'pendente' ? -1 : 0) - (b.status === 'pendente' ? -1 : 0))

  return (
    <>
      <View style={{ paddingHorizontal: espaco.lg, paddingTop: espaco.md }}>
        <Botao titulo="Adicionar ONG" icone="globe" pequeno onPress={() => { setErro(null); setForm({ nome: '', site: 'https://', area: 'tartarugas', descricao: '' }) }} />
      </View>
      <Lista dados={{ ...dados, dados: dados.dados ? ordenados : null }} erroExtra={erro} vazio="Nada por aqui.">
        {itens => itens.map(g => (
          <View key={`${g.tipoAdmin}-${g.id}`} style={estilos.item}>
            <View style={estilos.linha}>
              <Text style={estilos.titulo}>{g.nome}</Text>
              <Text style={{ color: g.status === 'pendente' ? cores.atencao : g.status === 'aprovada' ? cores.ok : cores.erro, fontSize: 12, fontWeight: '700' }}>{g.status}</Text>
            </View>
            <Text style={base.textoSuave}>
              {g.tipoAdmin === 'ongs' ? `ONG · ${temaLabel(g.area)}${g.sugeridaPor ? ` · sugerida por @${g.sugeridaPor}` : ''}`
                : `Comunidade · ${temaLabel(g.tema)} · criada por @${g.criador}`} · {g.membros} participante(s)
            </Text>
            <Text style={base.texto} numberOfLines={3}>{g.descricao}</Text>
            <View style={estilos.acoes}>
              {g.status !== 'aprovada' && <Botao titulo="Aprovar" pequeno onPress={() => void agir(admin.statusGrupo(g.tipoAdmin, g.id, 'aprovada'))} />}
              {g.status === 'pendente' && <Botao titulo="Recusar" pequeno variante="secundario" onPress={() => void agir(admin.statusGrupo(g.tipoAdmin, g.id, 'recusada'))} />}
              <Botao titulo="Excluir" pequeno variante="perigo" onPress={() => confirmar('Excluir', `Excluir ${g.nome} e o feed dela?`, () => void agir(admin.excluirGrupo(g.tipoAdmin, g.id)), 'Excluir')} />
            </View>
          </View>
        ))}
      </Lista>
      <Folha visivel={form !== null} titulo="Adicionar ONG" aoFechar={() => setForm(null)}>
        <Campo rotulo="Nome" value={form?.nome ?? ''} onChangeText={t => setForm(f => (f ? { ...f, nome: t } : f))} />
        <Campo rotulo="Site oficial" value={form?.site ?? ''} autoCapitalize="none" keyboardType="url" onChangeText={t => setForm(f => (f ? { ...f, site: t } : f))} />
        <Text style={base.textoSuave}>Área de atuação</Text>
        <Chips opcoes={TEMAS} valor={form?.area ?? 'tartarugas'} aoMudar={v => setForm(f => (f ? { ...f, area: v } : f))} rolavel={false} rotulo="Área" />
        <Campo rotulo="Descrição" multiline value={form?.descricao ?? ''} onChangeText={t => setForm(f => (f ? { ...f, descricao: t } : f))} />
        <Campo rotulo="Cidade (opcional)" value={form?.cidade ?? ''} onChangeText={t => setForm(f => (f ? { ...f, cidade: t } : f))} />
        <Campo rotulo="UF (opcional)" value={form?.uf ?? ''} maxLength={2} autoCapitalize="characters" onChangeText={t => setForm(f => (f ? { ...f, uf: t } : f))} />
        <Aviso tipo="erro" texto={erro} />
        <Botao titulo="Adicionar" onPress={criarOng} carregando={salvando} />
      </Folha>
    </>
  )
}

const estilos = StyleSheet.create({
  lista: { padding: espaco.lg, gap: espaco.md, paddingBottom: espaco.xxl },
  item: { backgroundColor: cores.painel, borderRadius: raio.lg, borderWidth: 1, borderColor: cores.borda, padding: espaco.lg, gap: 6 },
  titulo: { color: cores.texto, fontWeight: '700', fontSize: 15, flexShrink: 1 },
  admin: { color: cores.destaque, fontSize: 12 },
  linha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: espaco.sm },
  acoes: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.sm, marginTop: 4 },
})

export default AdminScreen
