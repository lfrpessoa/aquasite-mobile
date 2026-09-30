import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import type { CompositeScreenProps } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import PostCard from '../components/PostCard'
import PraiaProxima from '../components/PraiaProxima'
import Icone from '../components/Icone'
import Botao from '../components/Botao'
import { Aviso, EstadoVazio } from '../components/Estados'
import { useEu } from '../contexts/AuthContext'
import { usePresencaApp } from '../contexts/PresencaContext'
import { feed } from '../services/api'
import { ErroApi, mensagemDeErro } from '../services/http'
import { lerFeedSalvo, salvarFeed } from '../services/cache'
import { hora } from '../utils/formatar'
import { escolherImagem } from '../utils/imagem'
import { POSTS_POR_PAGINA } from '../config/ambiente'
import type { Post } from '../types/api'
import type { AbasParams, RaizParams } from '../types/navegacao'
import { cores, espaco, raio } from '../theme/tema'

type Props = CompositeScreenProps<BottomTabScreenProps<AbasParams, 'Feed'>, NativeStackScreenProps<RaizParams>>

/** Feed geral: os mesmos posts do site (GET /api/posts), em páginas de 20. */
const FeedScreen = ({ navigation }: Props) => {
  const eu = useEu()
  const { naoLidas } = usePresencaApp()
  const [posts, setPosts] = useState<Post[]>([])
  const [carregando, setCarregando] = useState(true)
  const [atualizando, setAtualizando] = useState(false)
  const [temMais, setTemMais] = useState(false)
  const [carregandoMais, setCarregandoMais] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  /** hora em que foi salvo o feed mostrado sem conexão (null = feed ao vivo da API) */
  const [offlineDesde, setOfflineDesde] = useState<number | null>(null)
  const curtindo = useRef(new Set<number>())

  /** Primeira página; mantém os posts mais antigos que a pessoa já carregou (igual ao site). */
  const carregar = useCallback(async (silencioso = false) => {
    try {
      const pagina = await feed.pagina()
      setPosts(atual => {
        if (pagina.length < POSTS_POR_PAGINA) return pagina
        const menorId = Math.min(...pagina.map(p => p.id))
        return [...pagina, ...atual.filter(p => p.id < menorId)]
      })
      if (!silencioso) setTemMais(pagina.length === POSTS_POR_PAGINA)
      setErro(null)
      setOfflineDesde(null)
      void salvarFeed(eu.username, pagina)
    } catch (e) {
      // sem conexão com a API: mostra o último feed salvo no aparelho (só leitura)
      if (e instanceof ErroApi && e.status === 0) {
        const salvo = await lerFeedSalvo(eu.username)
        if (salvo) {
          setPosts(atual => (atual.length > 0 ? atual : salvo.posts))
          setOfflineDesde(atual => atual ?? salvo.salvoEm)
          setTemMais(false)
          if (!silencioso) setErro(null)
          return
        }
      }
      if (!silencioso) setErro(mensagemDeErro(e))
    } finally {
      setCarregando(false)
      setAtualizando(false)
    }
  }, [eu.username])

  useEffect(() => {
    void carregar()
    const id = setInterval(() => { void carregar(true) }, 15_000) // posts novos aparecem sozinhos
    return () => clearInterval(id)
  }, [carregar])

  const carregarMais = async () => {
    if (!temMais || carregandoMais || posts.length === 0) return
    setCarregandoMais(true)
    try {
      const pagina = await feed.pagina(posts[posts.length - 1].id)
      setPosts(atual => [...atual, ...pagina.filter(p => !atual.some(q => q.id === p.id))])
      setTemMais(pagina.length === POSTS_POR_PAGINA)
    } catch (e) {
      setErro(mensagemDeErro(e))
    }
    setCarregandoMais(false)
  }

  const atualizarPost = (id: number, dados: Partial<Post>) =>
    setPosts(atual => atual.map(p => (p.id === id ? { ...p, ...dados } : p)))

  // o coração muda na hora e depois confirma com a API
  const curtir = useCallback(async (post: Post) => {
    if (curtindo.current.has(post.id)) return
    curtindo.current.add(post.id)
    const antes = { likes: post.likes, curtiu: post.curtiu }
    atualizarPost(post.id, { curtiu: !post.curtiu, likes: post.likes + (post.curtiu ? -1 : 1) })
    try {
      const r = post.curtiu ? await feed.descurtir(post.id) : await feed.curtir(post.id)
      atualizarPost(post.id, { likes: r.likes, curtiu: r.curtiu })
    } catch (e) {
      atualizarPost(post.id, antes)
      setErro(mensagemDeErro(e))
    } finally {
      curtindo.current.delete(post.id)
    }
  }, [])

  const comentar = useCallback(async (post: Post, texto: string) => {
    try {
      const c = await feed.comentar(post.id, texto)
      setPosts(atual => atual.map(p => (p.id === post.id ? { ...p, comments: [...p.comments, c] } : p)))
      return true
    } catch (e) {
      setErro(mensagemDeErro(e))
      return false
    }
  }, [])

  const apagar = useCallback(async (post: Post) => {
    try {
      const r = await feed.apagar(post.id)
      if (r.success) setPosts(atual => atual.filter(p => p.id !== post.id))
      else setErro(r.error ?? 'Não foi possível apagar.')
    } catch (e) {
      setErro(mensagemDeErro(e))
    }
  }, [])

  const abrirPerfil = useCallback((username: string) => {
    if (username === eu.username) navigation.navigate('Perfil')
    else navigation.navigate('Usuario', { username })
  }, [eu.username, navigation])

  const cabecalho = (
    <View style={{ gap: espaco.md }}>
      <NovoPost aoPublicar={p => setPosts(atual => [p, ...atual])} />
      <PraiaProxima aoAbrirMapa={() => navigation.navigate('Mapa')} />
      {offlineDesde !== null && (
        <Aviso tipo="atencao" texto={`Sem conexão com o AquaSite. Mostrando o feed salvo às ${hora(new Date(offlineDesde).toISOString())}. Puxe para baixo para tentar de novo.`} />
      )}
      <Aviso tipo="erro" texto={erro} />
    </View>
  )

  return (
    <SafeAreaView style={estilos.tela} edges={['top']}>
      <View style={estilos.topo}>
        <Text style={estilos.logo} accessibilityRole="header">AquaSite</Text>
        <View style={estilos.icones}>
          <Pressable onPress={() => navigation.navigate('Busca')} hitSlop={8} accessibilityRole="button" accessibilityLabel="Pesquisar">
            <Icone nome="search" tamanho={22} cor={cores.texto} />
          </Pressable>
          <Pressable onPress={() => navigation.navigate('Notificacoes')} hitSlop={8} accessibilityRole="button"
            accessibilityLabel={`Notificações${naoLidas ? `, ${naoLidas} não lidas` : ''}`}>
            <Icone nome="bell" tamanho={22} cor={cores.texto} />
            {naoLidas > 0 && <View style={estilos.badge}><Text style={estilos.badgeTexto}>{naoLidas > 9 ? '9+' : naoLidas}</Text></View>}
          </Pressable>
        </View>
      </View>
      <FlatList
        data={carregando ? [] : posts}
        keyExtractor={p => String(p.id)}
        renderItem={({ item }) => (
          <PostCard post={item} eu={eu.username} onCurtir={curtir} onComentar={comentar} onApagar={apagar} onAbrirPerfil={abrirPerfil} />
        )}
        ListHeaderComponent={cabecalho}
        ListEmptyComponent={carregando ? <ActivityIndicator color={cores.destaque} style={{ marginTop: 40 }} />
          : <EstadoVazio texto="Nenhum post ainda. Seja o primeiro a publicar!" />}
        ListFooterComponent={carregandoMais ? <ActivityIndicator color={cores.destaque} style={{ margin: 20 }} /> : null}
        onEndReached={carregarMais}
        onEndReachedThreshold={0.4}
        refreshControl={<RefreshControl refreshing={atualizando} tintColor={cores.destaque} colors={[cores.destaque]}
          onRefresh={() => { setAtualizando(true); void carregar() }} />}
        contentContainerStyle={estilos.lista}
        ItemSeparatorComponent={() => <View style={{ height: espaco.md }} />}
      />
    </SafeAreaView>
  )
}

/** Caixa "O que você está pensando?" com foto opcional (POST /api/posts). */
const NovoPost = ({ aoPublicar }: { aoPublicar: (p: Post) => void }) => {
  const eu = useEu()
  const [texto, setTexto] = useState('')
  const [foto, setFoto] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const escolher = async () => {
    try { const f = await escolherImagem(); if (f) setFoto(f) } catch (e) { setErro(mensagemDeErro(e)) }
  }

  const publicar = async () => {
    if (!texto.trim() && !foto) return
    setEnviando(true)
    setErro(null)
    try {
      const r = await feed.publicar(texto.trim(), foto)
      if (r.success === false) setErro(r.error ?? 'Não foi possível publicar.')
      else { aoPublicar(r); setTexto(''); setFoto(null) }
    } catch (e) {
      setErro(mensagemDeErro(e))
    }
    setEnviando(false)
  }

  return (
    <View style={estilos.novo}>
      <Text style={estilos.novoTitulo}>O que você está pensando, {eu.username}?</Text>
      <TextInput value={texto} onChangeText={setTexto} placeholder="Compartilhe algo sobre o oceano..." multiline
        placeholderTextColor={cores.textoApagado} style={estilos.novoInput} maxLength={2000} accessibilityLabel="Texto do post" />
      {foto && (
        <View>
          <Image source={{ uri: foto }} style={estilos.previa} accessibilityLabel="Foto escolhida" />
          <Pressable onPress={() => setFoto(null)} style={estilos.tirarFoto} accessibilityRole="button" accessibilityLabel="Tirar foto">
            <Icone nome="x" tamanho={16} cor="#fff" />
          </Pressable>
        </View>
      )}
      <Aviso tipo="erro" texto={erro} />
      <View style={estilos.novoAcoes}>
        <Botao titulo="Foto" icone="camera" variante="secundario" pequeno onPress={escolher} />
        <Botao titulo="Publicar" pequeno onPress={publicar} carregando={enviando} desativado={!texto.trim() && !foto} />
      </View>
    </View>
  )
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  topo: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: espaco.lg, paddingVertical: espaco.md, borderBottomWidth: 1, borderBottomColor: cores.borda,
  },
  logo: { color: cores.destaque, fontSize: 24, fontWeight: '800' },
  icones: { flexDirection: 'row', gap: espaco.xl },
  badge: {
    position: 'absolute', top: -6, right: -8, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: '#ef4444',
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  badgeTexto: { color: '#fff', fontSize: 11, fontWeight: '700' },
  lista: { padding: espaco.lg, paddingBottom: espaco.xxl },
  novo: { backgroundColor: cores.painel, borderRadius: raio.lg, borderWidth: 1, borderColor: cores.borda, padding: espaco.lg, gap: espaco.md },
  novoTitulo: { color: cores.textoSuave, fontSize: 14 },
  novoInput: {
    minHeight: 70, maxHeight: 180, color: cores.texto, fontSize: 15, borderRadius: raio.md, borderWidth: 1,
    borderColor: cores.bordaForte, padding: espaco.md, textAlignVertical: 'top', backgroundColor: 'rgba(255,255,255,0.04)',
  },
  previa: { width: '100%', height: 180, borderRadius: raio.md },
  tirarFoto: {
    position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center',
  },
  novoAcoes: { flexDirection: 'row', justifyContent: 'space-between' },
})

export default FeedScreen
