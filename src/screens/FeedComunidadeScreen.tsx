import React, { useEffect, useState } from 'react'
import { Alert, FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import Avatar from '../components/Avatar'
import Icone from '../components/Icone'
import Botao from '../components/Botao'
import ImagemAmpliavel from '../components/ImagemAmpliavel'
import { Aviso, Carregando, EstadoVazio } from '../components/Estados'
import { useEu } from '../contexts/AuthContext'
import { useCarregar } from '../hooks/useCarregar'
import { comunidade as api } from '../services/api'
import { mensagemDeErro } from '../services/http'
import { escolherImagem } from '../utils/imagem'
import { tempoAtras } from '../utils/formatar'
import type { FeedComunidade, PostComunidade } from '../types/api'
import type { RaizParams } from '../types/navegacao'
import { base, cores, espaco, raio } from '../theme/tema'

type Props = NativeStackScreenProps<RaizParams, 'FeedComunidade'>

/** Feed de uma comunidade ou ONG (GET/POST /api/comunidade/{tipo}/{id}/posts). Só membros publicam. */
const FeedComunidadeScreen = ({ route, navigation }: Props) => {
  const { tipo, id, nome } = route.params
  const eu = useEu()
  const feed = useCarregar<FeedComunidade>(() => api.feed(tipo, id), [tipo, id], 20_000)
  const [texto, setTexto] = useState('')
  const [foto, setFoto] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => { navigation.setOptions({ title: nome }) }, [navigation, nome])

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

  const apagarPost = (p: PostComunidade) => Alert.alert('Apagar post', p.autor === eu.username ? 'Apagar seu post?' : `Apagar o post de @${p.autor}?`, [
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
    <FlatList
      style={base.tela}
      data={feed.dados?.posts ?? []}
      keyExtractor={p => String(p.id)}
      contentContainerStyle={{ padding: espaco.lg, gap: espaco.md, paddingBottom: espaco.xxl }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={() => void feed.recarregar(true)} tintColor={cores.destaque} colors={[cores.destaque]} />}
      ListHeaderComponent={(
        <View style={{ gap: espaco.md }}>
          <Aviso tipo="erro" texto={erro ?? feed.erro} />
          {feed.dados?.podePublicar ? (
            <View style={base.cartao}>
              <TextInput value={texto} onChangeText={setTexto} placeholder={`Compartilhe algo com ${nome}...`} multiline maxLength={2000}
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
          aoApagarComentario={apagarComentario} aoAbrirPerfil={abrirPerfil} />
      )}
    />
  )
}

const PostDaComunidade = ({ post, aoCurtir, aoComentar, aoApagar, aoApagarComentario, aoAbrirPerfil }: {
  post: PostComunidade
  aoCurtir: (p: PostComunidade) => void
  aoComentar: (p: PostComunidade, t: string) => Promise<boolean>
  aoApagar: (p: PostComunidade) => void
  aoApagarComentario: (p: PostComunidade, id: number) => void
  aoAbrirPerfil: (u: string) => void
}) => {
  const [aberto, setAberto] = useState(false)
  const [texto, setTexto] = useState('')
  const enviar = async () => { if (texto.trim() && await aoComentar(post, texto.trim())) setTexto('') }

  return (
    <View style={[base.cartao, { gap: espaco.md }]}>
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
      {!!post.conteudo && <Text style={base.texto} selectable>{post.conteudo}</Text>}
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
      </View>
      {aberto && (
        <View style={{ gap: espaco.sm }}>
          {post.comentarios.map(c => (
            <View key={c.id} style={estilos.comentario}>
              <Text style={[base.texto, { flex: 1, fontSize: 14 }]}>
                <Text style={estilos.nome} onPress={() => aoAbrirPerfil(c.autor)}>@{c.autor}: </Text>{c.texto}
              </Text>
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
  comentario: { flexDirection: 'row', gap: espaco.sm, alignItems: 'flex-start' },
})

export default FeedComunidadeScreen
