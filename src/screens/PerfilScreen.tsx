import React, { useCallback, useState } from 'react'
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { perguntar } from '../utils/perguntar'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import type { CompositeScreenProps } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import CabecalhoPerfil from '../components/CabecalhoPerfil'
import PostCard from '../components/PostCard'
import ListaPessoas from '../components/ListaPessoas'
import TrocarSenha from '../components/TrocarSenha'
import Aparencia from '../components/Aparencia'
import Folha from '../components/Folha'
import Campo from '../components/Campo'
import Botao from '../components/Botao'
import Icone from '../components/Icone'
import { Aviso, Carregando } from '../components/Estados'
import { useAuth, useEu } from '../contexts/AuthContext'
import { useCarregar } from '../hooks/useCarregar'
import { contas, feed } from '../services/api'
import { mensagemDeErro } from '../services/http'
import { erroNoNome } from '../utils/nome'
import { escolherImagem } from '../utils/imagem'
import { calcularConquistas } from '../data/conteudo'
import type { PerfilStats, Post } from '../types/api'
import type { AbasParams, RaizParams } from '../types/navegacao'
import { base, cores, espaco, raio } from '../theme/tema'

type Props = CompositeScreenProps<BottomTabScreenProps<AbasParams, 'Perfil'>, NativeStackScreenProps<RaizParams>>

/** Meu perfil: os mesmos dados do /perfil do site (GET /api/users/{eu}/stats e /posts). */
const PerfilScreen = ({ navigation }: Props) => {
  const eu = useEu()
  const { ehAdmin, sair, atualizarConta } = useAuth()
  const perfil = useCarregar<PerfilStats>(() => contas.perfil(eu.username), [eu.username])
  const posts = useCarregar<Post[]>(() => contas.postsDe(eu.username), [eu.username])
  const [erro, setErro] = useState<string | null>(null)
  const [lista, setLista] = useState<'seguidores' | 'seguindo' | null>(null)
  const [editando, setEditando] = useState<'bio' | 'nome' | null>(null)
  const [valor, setValor] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [aparencia, setAparencia] = useState(false)

  const recarregar = useCallback(() => { void perfil.recarregar(true); void posts.recarregar(true) }, [perfil, posts])

  const trocarFoto = () => {
    const usar = async (origem: 'galeria' | 'camera') => {
      try {
        const f = await escolherImagem(origem, true)
        if (!f) return
        const r = await contas.alterarFoto(eu.username, f)
        if (r.success) recarregar(); else setErro(r.error ?? 'Não foi possível trocar a foto.')
      } catch (e) { setErro(mensagemDeErro(e)) }
    }
    perguntar('Foto de perfil', undefined, [
      { text: 'Escolher da galeria', onPress: () => void usar('galeria') },
      { text: 'Tirar foto', onPress: () => void usar('camera') },
      ...(perfil.dados?.avatar ? [{
        text: 'Remover foto', style: 'destructive' as const,
        onPress: () => { contas.alterarFoto(eu.username, '').then(recarregar).catch(e => setErro(mensagemDeErro(e))) },
      }] : []),
      { text: 'Cancelar', style: 'cancel' as const },
    ])
  }

  const abrirEdicao = (tipo: 'bio' | 'nome') => {
    setValor(tipo === 'bio' ? perfil.dados?.bio ?? '' : eu.username)
    setErro(null)
    setEditando(tipo)
  }

  const salvarEdicao = async () => {
    setSalvando(true)
    try {
      if (editando === 'bio') {
        const r = await contas.alterarBio(eu.username, valor.trim())
        if (!r.success) throw new Error(r.error ?? 'Não foi possível salvar.')
        perfil.definir(p => (p ? { ...p, bio: valor.trim() } : p))
      } else if (editando === 'nome') {
        const novo = valor.trim()
        if (novo === eu.username) { setEditando(null); setSalvando(false); return }
        const problema = erroNoNome(novo)
        if (problema) throw new Error(problema)
        const r = await contas.renomear(novo)
        if (!r.success || !r.newUsername) throw new Error(r.error ?? 'Não foi possível trocar o nome.')
        await atualizarConta(r.newUsername, r.token) // a API devolve um token novo com o nome novo
      }
      setEditando(null)
    } catch (e) {
      setErro(mensagemDeErro(e))
    }
    setSalvando(false)
  }

  const curtir = async (p: Post) => {
    try {
      const r = p.curtiu ? await feed.descurtir(p.id) : await feed.curtir(p.id)
      posts.definir(l => l?.map(x => (x.id === p.id ? { ...x, likes: r.likes, curtiu: r.curtiu } : x)) ?? null)
    } catch (e) { setErro(mensagemDeErro(e)) }
  }

  const apagar = async (p: Post) => {
    try {
      const r = await feed.apagar(p.id)
      if (r.success) recarregar(); else setErro(r.error ?? 'Não foi possível apagar.')
    } catch (e) { setErro(mensagemDeErro(e)) }
  }

  const confirmarSair = () => perguntar('Sair da conta', 'Deseja sair?', [
    { text: 'Cancelar', style: 'cancel' }, { text: 'Sair', style: 'destructive', onPress: () => void sair() },
  ])

  if (perfil.carregando && !perfil.dados) return <SafeAreaView style={base.tela}><Carregando /></SafeAreaView>

  const p = perfil.dados
  const curtidas = (posts.dados ?? []).reduce((soma, x) => soma + (x.likes || 0), 0)
  const conquistas = p ? calcularConquistas(p.postsCount, p.followingCount, curtidas) : []

  return (
    <SafeAreaView style={base.tela} edges={['top']}>
      <ScrollView contentContainerStyle={estilos.conteudo}
        refreshControl={<RefreshControl refreshing={false} onRefresh={recarregar} tintColor={cores.destaque} colors={[cores.destaque]} />}>
        <Aviso tipo="erro" texto={perfil.erro ?? erro} />
        {p && (
          <CabecalhoPerfil username={eu.username} perfil={p} aoTocarFoto={trocarFoto} aoTocarNome={() => abrirEdicao('nome')}
            aoAbrirLista={setLista}>
            <Botao titulo={p.bio ? 'Editar biografia' : 'Escrever biografia'} icone="pencil" variante="secundario" pequeno
              onPress={() => abrirEdicao('bio')} />
          </CabecalhoPerfil>
        )}

        {!!p?.email && (
          <View style={base.cartao}>
            <Text style={base.tituloSecao}>E-mail</Text>
            <Text style={base.texto}>{p.email}</Text>
          </View>
        )}

        <View style={base.cartao}>
          <Text style={base.tituloSecao}>Conquistas</Text>
          <Text style={[base.textoSuave, { marginBottom: espaco.md }]}>
            {conquistas.filter(c => c.ganhou).length} de {conquistas.length} conquistadas
          </Text>
          <View style={estilos.conquistas}>
            {conquistas.map(c => (
              <View key={c.nome} style={[estilos.conquista, !c.ganhou && estilos.bloqueada]} accessible
                accessibilityLabel={`${c.nome}: ${c.ganhou ? 'conquistada' : c.regra}`}>
                <Icone nome={c.icone} tamanho={22} cor={c.ganhou ? cores.destaque : cores.textoApagado} />
                <Text style={[estilos.conquistaNome, !c.ganhou && { color: cores.textoApagado }]}>{c.nome}</Text>
                <Text style={estilos.conquistaRegra}>{c.ganhou ? 'Conquistada' : c.regra}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={[base.tituloSecao, { marginTop: espaco.sm }]}>Meus posts</Text>
        {posts.dados?.length === 0 && <Text style={base.textoSuave}>Você ainda não publicou nada.</Text>}
        {posts.dados?.map(post => (
          <PostCard key={post.id} post={post} eu={eu.username} onCurtir={curtir} onApagar={apagar}
            onAbrirPerfil={u => (u === eu.username ? undefined : navigation.navigate('Usuario', { username: u }))} />
        ))}

        <TrocarSenha />

        <View style={base.cartao}>
          <Text style={base.tituloSecao}>Mais</Text>
          <Botao titulo="Animais marinhos" icone="fish" variante="texto" onPress={() => navigation.navigate('Animais')} estilo={estilos.link} />
          <Botao titulo="Curiosidades" icone="waves" variante="texto" onPress={() => navigation.navigate('Curiosidades')} estilo={estilos.link} />
          <Botao titulo="Sobre o AquaSite" icone="users" variante="texto" onPress={() => navigation.navigate('Sobre')} estilo={estilos.link} />
          <Botao titulo="Aparência e acessibilidade" icone="sun" variante="texto" onPress={() => setAparencia(true)} estilo={estilos.link} />
          {ehAdmin && <Botao titulo="Painel de administração" icone="lock" variante="texto" onPress={() => navigation.navigate('Admin')} estilo={estilos.link} />}
        </View>

        <Botao titulo="Sair da conta" variante="perigo" onPress={confirmarSair} />
      </ScrollView>

      {aparencia && <Aparencia visivel={aparencia} aoFechar={() => setAparencia(false)} />}

      <ListaPessoas visivel={lista !== null} username={eu.username} abaInicial={lista ?? 'seguidores'} eu={eu.username}
        aoFechar={() => setLista(null)} aoAbrirPerfil={u => navigation.navigate('Usuario', { username: u })} />

      <Folha visivel={editando !== null} titulo={editando === 'bio' ? 'Biografia' : 'Nome de usuário'} aoFechar={() => setEditando(null)}>
        {editando === 'nome' && (
          <Text style={base.textoSuave}>O nome muda em todo o AquaSite: posts, mensagens, seguidores e comunidades. Use de 3 a 30 letras, números, ponto, hífen ou sublinhado.</Text>
        )}
        <Campo value={valor} onChangeText={setValor} multiline={editando === 'bio'} autoCapitalize={editando === 'nome' ? 'none' : 'sentences'}
          maxLength={editando === 'bio' ? 300 : 30} rotulo={editando === 'bio' ? 'Conte um pouco sobre você' : 'Novo nome de usuário'} />
        <Aviso tipo="erro" texto={erro} />
        <Botao titulo="Salvar" onPress={salvarEdicao} carregando={salvando} />
      </Folha>
    </SafeAreaView>
  )
}

const estilos = StyleSheet.create({
  conteudo: { padding: espaco.lg, gap: espaco.md, paddingBottom: espaco.xxl },
  conquistas: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.sm },
  conquista: {
    width: '48%', flexGrow: 1, alignItems: 'center', gap: 4, padding: espaco.md, borderRadius: raio.md,
    borderWidth: 1, borderColor: 'rgba(0,212,255,0.25)', backgroundColor: 'rgba(0,212,255,0.07)',
  },
  bloqueada: { borderColor: cores.borda, backgroundColor: 'rgba(255,255,255,0.03)', borderStyle: 'dashed' },
  conquistaNome: { color: cores.destaque, fontWeight: '700', fontSize: 14, textAlign: 'center' },
  conquistaRegra: { color: cores.textoApagado, fontSize: 12, textAlign: 'center' },
  link: { alignSelf: 'flex-start' },
})

export default PerfilScreen
