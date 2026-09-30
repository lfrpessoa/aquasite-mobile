import React, { useMemo, useState } from 'react'
import { FlatList, Linking, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import type { CompositeScreenProps } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import Chips from '../components/Chips'
import Folha from '../components/Folha'
import Campo from '../components/Campo'
import Botao from '../components/Botao'
import Avatar from '../components/Avatar'
import Icone from '../components/Icone'
import { Aviso, Carregando, EstadoVazio } from '../components/Estados'
import { useEu } from '../contexts/AuthContext'
import { useCarregar } from '../hooks/useCarregar'
import { comunidade as api } from '../services/api'
import { mensagemDeErro } from '../services/http'
import { STATUS_PEDIDO, TEMAS, localTexto, temaLabel } from '../data/conteudo'
import type { Comunidade, Membro, MinhasSolicitacoes, Ong, TipoGrupo, Visibilidade } from '../types/api'
import type { AbasParams, RaizParams } from '../types/navegacao'
import { base, cores, espaco, raio } from '../theme/tema'

type Props = CompositeScreenProps<BottomTabScreenProps<AbasParams, 'Comunidade'>, NativeStackScreenProps<RaizParams>>
type Aba = 'ongs' | 'comunidades'
type Item = (Ong & { tipo: 'ong' }) | (Comunidade & { tipo: 'comunidade' })

/** Página Comunidade: ONGs reais e comunidades criadas pelos usuários (mesmos dados do site). */
const ComunidadeScreen = ({ navigation }: Props) => {
  const eu = useEu()
  const [aba, setAba] = useState<Aba>('ongs')
  const [filtro, setFiltro] = useState('')
  const [tema, setTema] = useState('')
  const [aberto, setAberto] = useState<Item | null>(null)
  const [formulario, setFormulario] = useState<'comunidade' | 'ong' | null>(null)
  const dados = useCarregar<{ ongs: Ong[]; comunidades: Comunidade[]; minhas: MinhasSolicitacoes | null }>(async () => {
    const [ongs, comunidades, minhas] = await Promise.all([api.ongs(), api.comunidades(), api.minhasSolicitacoes().catch(() => null)])
    return { ongs, comunidades, minhas }
  }, [])

  const lista: Item[] = useMemo(() => {
    const base_: Item[] = aba === 'ongs'
      ? (dados.dados?.ongs ?? []).map(o => ({ ...o, tipo: 'ong' as const }))
      : (dados.dados?.comunidades ?? []).map(c => ({ ...c, tipo: 'comunidade' as const }))
    const f = filtro.trim().toLowerCase()
    return base_.filter(i => (!tema || (i.tipo === 'ong' ? i.area : i.tema) === tema)
      && (!f || `${i.nome} ${i.descricao} ${i.cidade ?? ''} ${i.uf ?? ''}`.toLowerCase().includes(f)))
  }, [aba, dados.dados, filtro, tema])

  const temasDaAba = TEMAS.filter(t => (aba === 'ongs' ? dados.dados?.ongs : dados.dados?.comunidades)
    ?.some(x => ('area' in x ? x.area : x.tema) === t.valor))

  const pendentes = [
    ...(dados.dados?.minhas?.comunidades ?? []).map(s => ({ ...s, tipo: 'Comunidade' })),
    ...(dados.dados?.minhas?.ongs ?? []).map(s => ({ ...s, tipo: 'ONG sugerida' })),
  ].filter(s => s.status !== 'aprovada')

  const atualizarItem = (novo: Item) => {
    setAberto(novo)
    dados.definir(d => d && (novo.tipo === 'ong'
      ? { ...d, ongs: d.ongs.map(o => (o.id === novo.id ? novo : o)) }
      : { ...d, comunidades: d.comunidades.map(c => (c.id === novo.id ? novo : c)) }))
  }

  return (
    <SafeAreaView style={base.tela} edges={['top']}>
      <View style={estilos.topo}>
        <Text style={estilos.titulo} accessibilityRole="header">Comunidade</Text>
        <Chips<Aba> opcoes={[{ valor: 'ongs', label: 'ONGs' }, { valor: 'comunidades', label: 'Comunidades' }]}
          valor={aba} aoMudar={a => { setAba(a); setTema('') }} rotulo="Aba" />
      </View>
      {dados.carregando && !dados.dados ? <Carregando /> : (
        <FlatList
          data={lista}
          keyExtractor={i => `${i.tipo}-${i.id}`}
          contentContainerStyle={estilos.lista}
          refreshControl={<RefreshControl refreshing={false} onRefresh={() => void dados.recarregar(true)} tintColor={cores.destaque} colors={[cores.destaque]} />}
          ListHeaderComponent={(
            <View style={{ gap: espaco.md }}>
              <Aviso tipo="erro" texto={dados.erro} />
              <View style={estilos.busca}>
                <Icone nome="search" tamanho={16} cor={cores.textoApagado} />
                <TextInput value={filtro} onChangeText={setFiltro} placeholder={aba === 'ongs' ? 'Pesquisar ONGs' : 'Pesquisar comunidades'}
                  placeholderTextColor={cores.textoApagado} style={estilos.buscaInput} accessibilityLabel="Pesquisar" />
              </View>
              {temasDaAba.length > 1 && (
                <Chips opcoes={[{ valor: '', label: 'Todos os temas' }, ...temasDaAba]} valor={tema} aoMudar={setTema} rotulo="Tema" />
              )}
              <Botao titulo={aba === 'ongs' ? 'Sugerir uma ONG' : 'Solicitar uma comunidade'} icone="users" variante="secundario" pequeno
                onPress={() => setFormulario(aba === 'ongs' ? 'ong' : 'comunidade')} />
              {pendentes.length > 0 && (
                <View style={base.cartao}>
                  <Text style={base.tituloSecao}>Seus pedidos</Text>
                  {pendentes.map(s => (
                    <View key={`${s.tipo}-${s.id}`} style={estilos.pedido}>
                      <Icone nome={STATUS_PEDIDO[s.status].icone} tamanho={14} cor={s.status === 'recusada' ? cores.erro : cores.atencao} />
                      <Text style={base.texto}>{s.tipo}: {s.nome} · <Text style={base.textoSuave}>{STATUS_PEDIDO[s.status].texto}</Text></Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={<EstadoVazio icone="users" texto="Nada encontrado com esse filtro." />}
          ItemSeparatorComponent={() => <View style={{ height: espaco.md }} />}
          renderItem={({ item }) => (
            <Pressable style={estilos.cartao} onPress={() => setAberto(item)} accessibilityRole="button"
              accessibilityLabel={`${item.nome}. ${item.membros} participantes${item.participando ? '. Você participa' : ''}`}>
              <View style={estilos.cartaoTopo}>
                <Text style={estilos.tag}>{temaLabel(item.tipo === 'ong' ? item.area : item.tema)}</Text>
                {item.tipo === 'comunidade' && <Text style={estilos.tagSuave}>{item.visibilidade === 'publica' ? 'Pública' : 'Privada'}</Text>}
                {item.tipo === 'comunidade' && item.souAdmin && <Text style={estilos.tagAdmin}>Você é o admin</Text>}
              </View>
              <Text style={estilos.nome}>{item.nome}</Text>
              <Text style={base.textoSuave} numberOfLines={2}>{item.descricao}</Text>
              <View style={estilos.rodape}>
                <Text style={base.textoSuave}>{localTexto(item) || 'Brasil'} · {item.membros} participante{item.membros === 1 ? '' : 's'}</Text>
                {item.participando && <Text style={{ color: cores.ok, fontSize: 12, fontWeight: '700' }}>Participando</Text>}
                {item.tipo === 'comunidade' && item.pendente && <Text style={{ color: cores.atencao, fontSize: 12, fontWeight: '700' }}>Pedido enviado</Text>}
              </View>
            </Pressable>
          )}
        />
      )}

      {aberto && (
        <DetalheGrupo item={aberto} eu={eu.username} aoFechar={() => setAberto(null)} aoMudar={atualizarItem}
          aoAbrirFeed={i => { setAberto(null); navigation.navigate('FeedComunidade', { tipo: i.tipo, id: i.id, nome: i.nome }) }}
          aoAbrirPerfil={u => {
            setAberto(null)
            if (u === eu.username) navigation.navigate('Perfil')
            else navigation.navigate('Usuario', { username: u })
          }} />
      )}
      <FormularioPedido tipo={formulario} aoFechar={() => setFormulario(null)} aoEnviar={() => { setFormulario(null); void dados.recarregar(true) }} />
    </SafeAreaView>
  )
}

/** Detalhes de uma ONG ou comunidade: participar, membros, feed e (para o admin da comunidade) pedidos e visibilidade. */
const DetalheGrupo = ({ item, eu, aoFechar, aoMudar, aoAbrirFeed, aoAbrirPerfil }: {
  item: Item; eu: string; aoFechar: () => void; aoMudar: (i: Item) => void
  aoAbrirFeed: (i: Item) => void; aoAbrirPerfil: (u: string) => void
}) => {
  const tipo: TipoGrupo = item.tipo
  const souAdmin = item.tipo === 'comunidade' && !!item.souAdmin
  const membros = useCarregar<Membro[]>(() => api.membros(tipo, item.id), [item.id, item.membros])
  const pedidos = useCarregar<Membro[]>(async () => (souAdmin ? (await api.pedidos(item.id)).pedidos ?? [] : []), [item.id, souAdmin, item.membros])
  const [erro, setErro] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)

  const fazer = async (acao: () => Promise<void>) => {
    setOcupado(true); setErro(null)
    try { await acao() } catch (e) { setErro(mensagemDeErro(e)) }
    setOcupado(false)
  }

  const participar = () => fazer(async () => {
    const r = item.participando || (item.tipo === 'comunidade' && item.pendente) ? await api.sair(tipo, item.id) : await api.participar(tipo, item.id)
    if (!r.success) throw new Error(r.error ?? 'Não foi possível.')
    aoMudar({ ...item, participando: !!r.participando, membros: r.membros ?? item.membros,
      ...(item.tipo === 'comunidade' ? { pendente: !!r.pendente } : {}) } as Item)
  })

  const mudarVisibilidade = (v: Visibilidade) => fazer(async () => {
    const r = await api.visibilidade(item.id, v)
    if (!r.success) throw new Error(r.error ?? 'Não foi possível.')
    if (item.tipo === 'comunidade') aoMudar({ ...item, visibilidade: r.visibilidade ?? v, membros: item.membros + (r.pedidosAceitos ?? 0) })
  })

  const responder = (u: string, aceitar: boolean) => fazer(async () => {
    const r = aceitar ? await api.aceitar(item.id, u) : await api.recusar(item.id, u)
    if (!r.success) throw new Error(r.error ?? 'Não foi possível.')
    await pedidos.recarregar(true)
    if (aceitar && 'membros' in r && typeof r.membros === 'number') aoMudar({ ...item, membros: r.membros })
  })

  const remover = (u: string) => fazer(async () => {
    const r = await api.removerMembro(item.id, u)
    if (!r.success) throw new Error(r.error ?? 'Não foi possível.')
    aoMudar({ ...item, membros: r.membros ?? item.membros - 1 })
  })

  const privada = item.tipo === 'comunidade' && item.visibilidade !== 'publica'
  const podeVerFeed = item.tipo === 'ong' || !privada || item.participando || souAdmin
  const textoParticipar = item.participando ? 'Sair' : item.tipo === 'comunidade' && item.pendente ? 'Cancelar pedido'
    : privada ? 'Pedir para entrar' : 'Participar'

  return (
    <Folha visivel titulo={item.nome} aoFechar={aoFechar}>
      <Text style={estilos.tag}>{temaLabel(item.tipo === 'ong' ? item.area : item.tema)}{item.tipo === 'comunidade' ? ` · ${privada ? 'Privada' : 'Pública'}` : ''}</Text>
      <Text style={base.texto}>{item.descricao}</Text>
      <Text style={base.textoSuave}>{localTexto(item) || 'Brasil'} · {item.membros} participante{item.membros === 1 ? '' : 's'}
        {item.tipo === 'comunidade' ? ` · criada por @${item.criador}` : ''}</Text>
      {item.tipo === 'ong' && (
        <Botao titulo="Site oficial" icone="globe" variante="texto" pequeno onPress={() => void Linking.openURL(item.site)} estilo={{ alignSelf: 'flex-start' }} />
      )}
      <Aviso tipo="erro" texto={erro} />
      <View style={estilos.botoes}>
        {!souAdmin && <Botao titulo={textoParticipar} pequeno variante={item.participando ? 'perigo' : 'primario'} onPress={participar} carregando={ocupado} />}
        {podeVerFeed && <Botao titulo="Abrir feed" icone="message" pequeno variante="secundario" onPress={() => aoAbrirFeed(item)} />}
      </View>
      {item.tipo === 'ong' && <Text style={base.textoSuave}>Participar é um apoio dentro do AquaSite. Voluntariado e doações são feitos pelo site da ONG.</Text>}

      {souAdmin && (
        <View style={base.cartao}>
          <Text style={base.tituloSecao}>Você é o admin desta comunidade</Text>
          <Chips<Visibilidade> opcoes={[{ valor: 'publica', label: 'Pública' }, { valor: 'privada', label: 'Privada' }]}
            valor={privada ? 'privada' : 'publica'} aoMudar={mudarVisibilidade} rotulo="Visibilidade" />
          <Text style={[base.textoSuave, { marginTop: 6 }]}>Pública: qualquer pessoa entra. Privada: você aprova quem entra.</Text>
          {(pedidos.dados?.length ?? 0) > 0 && <Text style={[base.tituloSecao, { marginTop: espaco.md }]}>Pedidos para entrar</Text>}
          {pedidos.dados?.map(p => (
            <View key={p.username} style={estilos.membro}>
              <Pressable style={estilos.membroInfo} onPress={() => aoAbrirPerfil(p.username)} accessibilityRole="link">
                <Avatar username={p.username} url={p.avatar} tamanho={36} /><Text style={base.texto}>@{p.username}</Text>
              </Pressable>
              <Botao titulo="Aceitar" pequeno onPress={() => responder(p.username, true)} />
              <Botao titulo="Recusar" pequeno variante="perigo" onPress={() => responder(p.username, false)} />
            </View>
          ))}
        </View>
      )}

      <Text style={base.tituloSecao}>Participantes</Text>
      {membros.dados?.length === 0 && <Text style={base.textoSuave}>Ninguém participa ainda.</Text>}
      {membros.dados?.map(m => (
        <View key={m.username} style={estilos.membro}>
          <Pressable style={estilos.membroInfo} onPress={() => aoAbrirPerfil(m.username)} accessibilityRole="link">
            <Avatar username={m.username} url={m.avatar} tamanho={36} />
            <Text style={base.texto}>@{m.username}{m.admin ? '  · admin' : ''}</Text>
          </Pressable>
          {souAdmin && !m.admin && m.username !== eu && <Botao titulo="Remover" pequeno variante="texto" onPress={() => remover(m.username)} />}
        </View>
      ))}
    </Folha>
  )
}

/** "Solicitar uma comunidade" e "Sugerir uma ONG": o pedido vai para os admins aprovarem. */
const FormularioPedido = ({ tipo, aoFechar, aoEnviar }: { tipo: 'comunidade' | 'ong' | null; aoFechar: () => void; aoEnviar: () => void }) => {
  const [nome, setNome] = useState('')
  const [tema, setTema] = useState('tartarugas')
  const [descricao, setDescricao] = useState('')
  const [site, setSite] = useState('https://')
  const [cidade, setCidade] = useState('')
  const [uf, setUf] = useState('')
  const [visibilidade, setVisibilidade] = useState<Visibilidade>('publica')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const enviar = async () => {
    setEnviando(true); setErro(null)
    try {
      const comum = { nome: nome.trim(), descricao: descricao.trim(), cidade: cidade.trim() || undefined, uf: uf.trim().toUpperCase() || undefined }
      const r = tipo === 'ong'
        ? await api.sugerirOng({ ...comum, area: tema, site: site.trim() })
        : await api.solicitarComunidade({ ...comum, tema, visibilidade })
      if (!r.success) throw new Error(r.error ?? 'Não foi possível enviar.')
      setNome(''); setDescricao(''); setCidade(''); setUf(''); setSite('https://')
      aoEnviar()
    } catch (e) { setErro(mensagemDeErro(e)) }
    setEnviando(false)
  }

  return (
    <Folha visivel={tipo !== null} titulo={tipo === 'ong' ? 'Sugerir uma ONG' : 'Solicitar uma comunidade'} aoFechar={aoFechar}>
      <Text style={base.textoSuave}>O pedido vai para o suporte do AquaSite. {tipo === 'comunidade' ? 'Quando for aprovado, você vira o admin da comunidade.' : 'Informe uma ONG real, com o site oficial.'}</Text>
      <Campo rotulo="Nome" value={nome} onChangeText={setNome} maxLength={tipo === 'ong' ? 120 : 80} />
      <Text style={estilos.rotulo}>{tipo === 'ong' ? 'Área de atuação' : 'Tema'}</Text>
      <Chips opcoes={TEMAS} valor={tema} aoMudar={setTema} rolavel={false} rotulo="Tema" />
      {tipo === 'ong' && <Campo rotulo="Site oficial" value={site} onChangeText={setSite} autoCapitalize="none" keyboardType="url" />}
      <Campo rotulo={tipo === 'ong' ? 'O que a ONG faz' : 'Objetivo da comunidade'} value={descricao} onChangeText={setDescricao} multiline maxLength={1000}
        dica="Mínimo de 10 caracteres." />
      <View style={{ flexDirection: 'row', gap: espaco.sm }}>
        <View style={{ flex: 3 }}><Campo rotulo="Cidade (opcional)" value={cidade} onChangeText={setCidade} /></View>
        <View style={{ flex: 1 }}><Campo rotulo="UF" value={uf} onChangeText={setUf} maxLength={2} autoCapitalize="characters" /></View>
      </View>
      {tipo === 'comunidade' && (
        <>
          <Text style={estilos.rotulo}>Quem pode entrar</Text>
          <Chips<Visibilidade> opcoes={[{ valor: 'publica', label: 'Pública (qualquer pessoa)' }, { valor: 'privada', label: 'Privada (eu aprovo)' }]}
            valor={visibilidade} aoMudar={setVisibilidade} rolavel={false} rotulo="Visibilidade" />
        </>
      )}
      <Aviso tipo="erro" texto={erro} />
      <Botao titulo="Enviar para o suporte" onPress={enviar} carregando={enviando} />
    </Folha>
  )
}

const estilos = StyleSheet.create({
  topo: { paddingHorizontal: espaco.lg, paddingTop: espaco.md, paddingBottom: espaco.sm, gap: espaco.sm, borderBottomWidth: 1, borderBottomColor: cores.borda },
  titulo: { color: cores.texto, fontSize: 22, fontWeight: '800' },
  lista: { padding: espaco.lg, paddingBottom: espaco.xxl, gap: espaco.md },
  busca: {
    flexDirection: 'row', alignItems: 'center', gap: espaco.sm, paddingHorizontal: espaco.md, borderRadius: raio.pilula,
    borderWidth: 1, borderColor: cores.bordaForte, backgroundColor: 'rgba(255,255,255,0.05)',
  },
  buscaInput: { flex: 1, color: cores.texto, minHeight: 44 },
  cartao: { backgroundColor: cores.painel, borderRadius: raio.lg, borderWidth: 1, borderColor: cores.borda, padding: espaco.lg, gap: 6 },
  cartaoTopo: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { color: cores.destaque, fontSize: 12, fontWeight: '700' },
  tagSuave: { color: cores.textoApagado, fontSize: 12 },
  tagAdmin: { color: cores.ok, fontSize: 12, fontWeight: '700' },
  nome: { color: cores.texto, fontSize: 17, fontWeight: '700' },
  rodape: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  pedido: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  botoes: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.sm },
  membro: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm, paddingVertical: 4 },
  membroInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  rotulo: { color: cores.textoSuave, fontSize: 13, fontWeight: '600' },
})

export default ComunidadeScreen
