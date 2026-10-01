import React, { useEffect, useRef, useState } from 'react'
import { FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native'
import { perguntar } from '../utils/perguntar'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import Avatar from '../components/Avatar'
import Icone from '../components/Icone'
import Botao from '../components/Botao'
import ImagemAmpliavel from '../components/ImagemAmpliavel'
import FolhaCompartilhar from '../components/FolhaCompartilhar'
import TextoComLinks from '../components/TextoComLinks'
import { Aviso, Carregando, EstadoVazio } from '../components/Estados'
import { useEu } from '../contexts/AuthContext'
import { useCarregar } from '../hooks/useCarregar'
import { comunidade as api } from '../services/api'
import { mensagemDeErro } from '../services/http'
import { escolherImagem } from '../utils/imagem'
import { tempoAtras } from '../utils/formatar'
import { alvos } from '../utils/compartilhar'
import type { AlvoCompartilhar } from '../utils/compartilhar'
import type { FeedComunidade, PostComunidade, TipoGrupo } from '../types/api'
import type { RaizParams } from '../types/navegacao'
import { base, cores, espaco, raio } from '../theme/tema'

type Props = NativeStackScreenProps<RaizParams, 'FeedComunidade'>

/**
 * Feed de uma comunidade ou ONG (GET/POST /api/comunidade/{tipo}/{id}/posts). Só membros publicam.
 * Aberta por um link compartilhado, rola até o post do link (postId) e destaca o comentário (comentarioId).
 */
const FeedComunidadeScreen = ({ route, navigation }: Props) => {
  const { tipo, id, postId, comentarioId } = route.params
  const eu = useEu()
  // pelo link só vem o id: o nome é buscado na lista de ONGs/comunidades
  const [nome, setNome] = useState(route.params.nome)
  const [compartilhar, setCompartilhar] = useState<AlvoCompartilhar | null>(null)
  const listaRef = useRef<FlatList<PostComunidade>>(null)
  const jaRolou = useRef(false)
  const feed = useCarregar<FeedComunidade>(() => api.feed(tipo, id), [tipo, id], 20_000)
  const [texto, setTexto] = useState('')
  const [foto, setFoto] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (nome) return
    const buscar = tipo === 'ong' ? api.ongs() : api.comunidades()
    buscar.then(l => { const g = l.find(x => x.id === id); if (g) setNome(g.nome) }).catch(() => { /* fica "Feed" */ })
  }, [tipo, id, nome])

  useEffect(() => {
    navigation.setOptions({
      title: nome ?? 'Feed',
      headerRight: () => (
        <Pressable onPress={() => setCompartilhar(alvos.grupo(tipo, { id, nome: nome ?? (tipo === 'ong' ? 'ONG' : 'Comunidade') }))}
          hitSlop={10} accessibilityRole="button" accessibilityLabel={tipo === 'ong' ? 'Compartilhar ONG' : 'Compartilhar comunidade'}>
          <Icone nome="share" tamanho={21} cor={cores.destaque} />
        </Pressable>
      ),
    })
  }, [navigation, nome, tipo, id])

  // chegou pelo link de um post: rola até ele quando o feed carrega
  const posts = feed.dados?.posts
  useEffect(() => {
    if (postId == null || !posts || jaRolou.current) return
    const i = posts.findIndex(p => p.id === postId)
    if (i < 0) return
    jaRolou.current = true
    setTimeout(() => listaRef.current?.scrollToIndex({ index: i, viewPosition: 0.1, animated: true }), 300)
  }, [posts, postId])

  const definirPost = (postId: number, mudar: (p: PostComunidade) => PostComunidade | null) =>
    feed.definir(f => f && { ...f, posts: (f.posts ?? []).map(p => (p.id === postId ? mudar(p) : p)).filter((p): p is PostComunidade => p !== null) })

  const publicar = async () => {
    if (!texto.trim() && !foto) return
    setEnviando(true); setErro(null)
    try {
      const r = await api.publicar(tipo, id, texto.trim(), foto)
      if (!r.success) throw new Error(r.error ?? 'Não foi possível publicar.')
      setTexto(''); setFoto(null)
      await feed.recarregar(true)
    } catch (e) { setErro(mensagemDeErro(e)) }
    setEnviando(false)
  }

  const curtir = async (p: PostComunidade) => {
    definirPost(p.id, x => ({ ...x, curtiu: !x.curtiu, curtidas: x.curtidas + (x.curtiu ? -1 : 1) }))
    try {
      const r = await api.curtir(p.id)
      if (!r.success) throw new Error(r.error ?? 'Não foi possível curtir.')
      definirPost(p.id, x => ({ ...x, curtiu: !!r.curtiu, curtidas: r.curtidas ?? x.curtidas }))
    } catch (e) {
      definirPost(p.id, () => p)
      setErro(mensagemDeErro(e))
    }
  }

  const comentar = async (p: PostComunidade, t: string) => {
    try {
      const r = await api.comentar(p.id, t)
      if (!r.success || !r.comentario) throw new Error(r.error ?? 'Não foi possível comentar.')
      const c = r.comentario
      definirPost(p.id, x => ({ ...x, comentarios: [...x.comentarios, c] }))
      return true
    } catch (e) { setErro(mensagemDeErro(e)); return false }
  }

  const apagarPost = (p: PostComunidade) => perguntar('Apagar post', p.autor === eu.username ? 'Apagar seu post?' : `Apagar o post de @${p.autor}?`, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Apagar', style: 'destructive', onPress: () => {
      api.apagarPost(p.id).then(r => (r.success ? definirPost(p.id, () => null) : setErro(r.error ?? 'Não foi possível apagar.')))
        .catch(e => setErro(mensagemDeErro(e)))
    } },
  ])

  const apagarComentario = (p: PostComunidade, cid: number) => {
    api.apagarComentario(cid).then(r => (r.success
      ? definirPost(p.id, x => ({ ...x, comentarios: x.comentarios.filter(c => c.id !== cid) }))
      : setErro(r.error ?? 'Não foi possível apagar.'))).catch(e => setErro(mensagemDeErro(e)))
  }

  const abrirPerfil = (u: string) => {
    if (u === eu.username) navigation.navigate('Abas', { screen: 'Perfil' })
    else navigation.navigate('Usuario', { username: u })
  }

  if (feed.carregando && !feed.dados) return <View style={base.tela}><Carregando /></View>
  if (feed.dados && !feed.dados.success) {
    return <View style={base.tela}><EstadoVazio icone="lock" texto={feed.dados.error ?? 'Você não tem acesso a este feed.'} /></View>
  }

  return (
    <>
    <FlatList
      ref={listaRef}
      onScrollToIndexFailed={({ index, averageItemLength }) => {
        // o item ainda não foi medido: chega perto e tenta de novo
        listaRef.current?.scrollToOffset({ offset: index * averageItemLength, animated: false })
        setTimeout(() => listaRef.current?.scrollToIndex({ index, viewPosition: 0.1, animated: true }), 250)
      }}
      style={base.tela}
      data={feed.dados?.posts ?? []}
      keyExtractor={p => String(p.id)}
      contentContainerStyle={{ padding: espaco.lg, gap: espaco.md, paddingBottom: espaco.xxl }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={() => void feed.recarregar(true)} tintColor={cores.destaque} colors={[cores.destaque]} />}
      ListHeaderComponent={(
        <View style={{ gap: espaco.md }}>
          <Aviso tipo="erro" texto={erro ?? feed.erro} />
          {postId != null && posts && !posts.some(p => p.id === postId) && (
            <Aviso tipo="atencao" texto="O post compartilhado não está mais neste feed. Ele pode ter sido apagado." />
          )}
          {feed.dados?.podePublicar ? (
            <View style={base.cartao}>
              <TextInput value={texto} onChangeText={setTexto} placeholder={`Compartilhe algo com ${nome ?? 'o grupo'}...`} multiline maxLength={2000}
                placeholderTextColor={cores.textoApagado} style={estilos.input} accessibilityLabel="Texto do post" />
              {foto && <Image source={{ uri: foto }} style={estilos.previa} accessibilityLabel="Foto escolhida" />}
              <View style={estilos.linhaBotoes}>
                <Botao titulo={foto ? 'Tirar foto' : 'Foto'} icone="camera" pequeno variante="secundario"
                  onPress={() => (foto ? setFoto(null) : void escolherImagem().then(f => f && setFoto(f)).catch(e => setErro(mensagemDeErro(e))))} />
                <Botao titulo="Publicar" pequeno onPress={publicar} carregando={enviando} desativado={!texto.trim() && !foto} />
              </View>
            </View>
          ) : (
            <Aviso tipo="info" texto="Só participantes publicam aqui. Entre na página Comunidade e toque em Participar." />
          )}
        </View>
      )}
      ListEmptyComponent={<EstadoVazio icone="message" texto="Nenhuma publicação ainda." />}
      renderItem={({ item }) => (
        <PostDaComunidade post={item} aoCurtir={curtir} aoComentar={comentar} aoApagar={apagarPost}
          aoApagarComentario={apagarComentario} aoAbrirPerfil={abrirPerfil}
          grupo={{ tipo, id, nome }} destacado={item.id === postId}
          comentarioDestacado={item.id === postId ? comentarioId : undefined} aoCompartilhar={setCompartilhar} />
      )}
    />
    {compartilhar && <FolhaCompartilhar alvo={compartilhar} aoFechar={() => setCompartilhar(null)} />}
    </>
  )
}

const PostDaComunidade = ({ post, aoCurtir, aoComentar, aoApagar, aoApagarComentario, aoAbrirPerfil, grupo, destacado, comentarioDestacado, aoCompartilhar }: {
  post: PostComunidade
  grupo: { tipo: TipoGrupo; id: number; nome?: string }
  destacado: boolean
  comentarioDestacado?: number
  aoCompartilhar: (a: AlvoCompartilhar) => void
  aoCurtir: (p: PostComunidade) => void
  aoComentar: (p: PostComunidade, t: string) => Promise<boolean>
  aoApagar: (p: PostComunidade) => void
  aoApagarComentario: (p: PostComunidade, id: number) => void
  aoAbrirPerfil: (u: string) => void
}) => {
  const [aberto, setAberto] = useState(comentarioDestacado != null)
  const [texto, setTexto] = useState('')
  const enviar = async () => { if (texto.trim() && await aoComentar(post, texto.trim())) setTexto('') }

  return (
    <View style={[base.cartao, { gap: espaco.md }, destacado && comentarioDestacado == null && estilos.destacado]}>
      <View style={estilos.topo}>
        <Pressable style={estilos.autor} onPress={() => aoAbrirPerfil(post.autor)} accessibilityRole="link" accessibilityLabel={`Perfil de @${post.autor}`}>
          <Avatar username={post.autor} url={post.avatar} tamanho={36} />
          <View>
            <Text style={estilos.nome}>@{post.autor}{post.autorAdmin ? '  · admin' : ''}</Text>
            <Text style={base.textoSuave}>{tempoAtras(post.created_at)}</Text>
          </View>
        </Pressable>
        {post.podeApagar && (
          <Pressable onPress={() => aoApagar(post)} hitSlop={10} accessibilityRole="button" accessibilityLabel="Apagar post">
            <Icone nome="trash" tamanho={18} cor={cores.textoApagado} />
          </Pressable>
        )}
      </View>
      {!!post.conteudo && <TextoComLinks texto={post.conteudo} estilo={base.texto} />}
      {post.imagem && <ImagemAmpliavel uri={post.imagem} descricao={`Foto publicada por @${post.autor}`} estilo={estilos.imagem} />}
      <View style={estilos.linhaBotoes}>
        <Pressable onPress={() => aoCurtir(post)} style={estilos.acao} accessibilityRole="button" accessibilityState={{ selected: post.curtiu }}
          accessibilityLabel={`${post.curtiu ? 'Descurtir' : 'Curtir'}. ${post.curtidas} curtidas`}>
          <Icone nome="heart" tamanho={17} cor={cores.curtida} preenchimento={post.curtiu ? cores.curtida : 'none'} />
          <Text style={{ color: cores.curtida, fontWeight: '600' }}>{post.curtidas}</Text>
        </Pressable>
        <Pressable onPress={() => setAberto(a => !a)} style={estilos.acao} accessibilityRole="button" accessibilityLabel={`Comentários: ${post.comentarios.length}`}>
          <Icone nome="message" tamanho={17} cor={cores.textoSuave} />
          <Text style={{ color: cores.textoSuave, fontWeight: '600' }}>{post.comentarios.length}</Text>
        </Pressable>
        <Pressable onPress={() => aoCompartilhar(alvos.postDoGrupo(grupo.tipo, grupo.id, grupo.nome, post))} style={[estilos.acao, { marginLeft: 'auto' }]}
          accessibilityRole="button" accessibilityLabel="Compartilhar post">
          <Icone nome="share" tamanho={16} cor={cores.textoSuave} />
        </Pressable>
      </View>
      {aberto && (
        <View style={{ gap: espaco.sm }}>
          {post.comentarios.map(c => (
            <View key={c.id} style={[estilos.comentario, c.id === comentarioDestacado && estilos.destacado]}>
              <Text style={[base.texto, { flex: 1, fontSize: 14 }]}>
                <Text style={estilos.nome} onPress={() => aoAbrirPerfil(c.autor)}>@{c.autor}: </Text>{c.texto}
              </Text>
              <Pressable onPress={() => aoCompartilhar(alvos.comentarioDoGrupo(grupo.tipo, grupo.id, grupo.nome, post.id, c))} hitSlop={8}
                accessibilityRole="button" accessibilityLabel={'Compartilhar comentário de @' + c.autor}>
                <Icone nome="share" tamanho={15} cor={cores.textoApagado} />
              </Pressable>
              {c.podeApagar && (
                <Pressable onPress={() => aoApagarComentario(post, c.id)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Apagar comentário">
                  <Icone nome="x" tamanho={15} cor={cores.textoApagado} />
                </Pressable>
              )}
            </View>
          ))}
          <View style={estilos.linhaBotoes}>
            <TextInput value={texto} onChangeText={setTexto} placeholder="Comentar..." placeholderTextColor={cores.textoApagado}
              style={[estilos.input, { minHeight: 42, flex: 1 }]} onSubmitEditing={enviar} returnKeyType="send" maxLength={500} accessibilityLabel="Novo comentário" />
            <Botao titulo="Enviar" pequeno onPress={enviar} desativado={!texto.trim()} />
          </View>
        </View>
      )}
    </View>
  )
}

const estilos = StyleSheet.create({
  input: {
    minHeight: 70, color: cores.texto, fontSize: 15, borderRadius: raio.md, borderWidth: 1, borderColor: cores.bordaForte,
    padding: espaco.md, textAlignVertical: 'top', backgroundColor: 'rgba(255,255,255,0.04)', marginBottom: espaco.sm,
  },
  previa: { width: '100%', height: 160, borderRadius: raio.md, marginBottom: espaco.sm },
  linhaBotoes: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: espaco.sm },
  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  autor: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm, flexShrink: 1 },
  nome: { color: cores.destaque, fontWeight: '700' },
  imagem: { width: '100%', aspectRatio: 4 / 3, borderRadius: raio.md },
  acao: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, minHeight: 36, borderRadius: raio.pilula, borderWidth: 1, borderColor: cores.borda },
  comentario: { flexDirection: 'row', gap: espaco.sm, alignItems: 'flex-start', borderRadius: raio.sm, padding: 4 },
  destacado: { borderWidth: 1, borderColor: cores.destaque, backgroundColor: cores.destaqueFundo },
})

export default FeedComunidadeScreen
