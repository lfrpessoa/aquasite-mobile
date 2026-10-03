import React, { useEffect, useState } from 'react'
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import CabecalhoPerfil from '../components/CabecalhoPerfil'
import PostCard from '../components/PostCard'
import ListaPessoas from '../components/ListaPessoas'
import ModalDenuncia from '../components/ModalDenuncia'
import Botao from '../components/Botao'
import { Aviso, Carregando, EstadoVazio } from '../components/Estados'
import Destaques from '../components/story/Destaques'
import GradePosts, { AbasPerfil } from '../components/story/GradePosts'
import { useEu } from '../contexts/AuthContext'
import { useCarregar } from '../hooks/useCarregar'
import { contas, feed } from '../services/api'
import { mensagemDeErro } from '../services/http'
import type { PerfilStats, Post } from '../types/api'
import type { RaizParams } from '../types/navegacao'
import { base, cores, espaco } from '../theme/tema'

type Props = NativeStackScreenProps<RaizParams, 'Usuario'>

/** Perfil de outra pessoa: seguir, mandar mensagem, denunciar, ver os destaques e os posts dela (em grade ou lista). */
const UsuarioScreen = ({ route, navigation }: Props) => {
  const { username } = route.params
  const eu = useEu()
  const perfil = useCarregar<PerfilStats>(() => contas.perfil(username), [username])
  const posts = useCarregar<Post[]>(() => contas.postsDe(username), [username])
  const [sigo, setSigo] = useState<boolean | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [lista, setLista] = useState<'seguidores' | 'seguindo' | null>(null)
  const [denunciar, setDenunciar] = useState(false)
  const [aba, setAba] = useState<'grade' | 'lista'>('grade')

  useEffect(() => {
    navigation.setOptions({ title: `@${username}` })
    contas.sigo(username, eu.username).then(r => setSigo(r.following)).catch(() => setSigo(false))
  }, [username, eu.username, navigation])

  const alternarSeguir = async () => {
    if (sigo === null) return
    const antes = sigo
    setSigo(!antes)
    perfil.definir(p => (p ? { ...p, followersCount: p.followersCount + (antes ? -1 : 1) } : p))
    try {
      const r = antes ? await contas.deixarDeSeguir(username) : await contas.seguir(username)
      if (!r.success) throw new Error(r.error ?? 'Não foi possível.')
    } catch (e) {
      setSigo(antes)
      void perfil.recarregar(true)
      setErro(mensagemDeErro(e))
    }
  }

  const curtir = async (p: Post) => {
    try {
      const r = p.curtiu ? await feed.descurtir(p.id) : await feed.curtir(p.id)
      posts.definir(l => l?.map(x => (x.id === p.id ? { ...x, likes: r.likes, curtiu: r.curtiu } : x)) ?? null)
    } catch (e) { setErro(mensagemDeErro(e)) }
  }

  const comentar = async (p: Post, texto: string) => {
    try {
      const c = await feed.comentar(p.id, texto)
      posts.definir(l => l?.map(x => (x.id === p.id ? { ...x, comments: [...x.comments, c] } : x)) ?? null)
      return true
    } catch (e) { setErro(mensagemDeErro(e)); return false }
  }

  if (perfil.carregando && !perfil.dados) return <View style={base.tela}><Carregando /></View>
  if (perfil.dados?.error || (!perfil.dados && perfil.erro)) {
    return <View style={base.tela}><EstadoVazio icone="user" texto={perfil.dados?.error ?? perfil.erro ?? 'Usuário não encontrado.'} /></View>
  }
  const p = perfil.dados

  return (
    <ScrollView style={base.tela} contentContainerStyle={estilos.conteudo}
      refreshControl={<RefreshControl refreshing={false} tintColor={cores.destaque} colors={[cores.destaque]}
        onRefresh={() => { void perfil.recarregar(true); void posts.recarregar(true) }} />}>
      <Aviso tipo="erro" texto={erro} />
      {p && (
        <CabecalhoPerfil username={username} perfil={p} aoAbrirLista={setLista}>
          <View style={estilos.botoes}>
            <Botao titulo={sigo ? 'Seguindo' : 'Seguir'} pequeno variante={sigo ? 'secundario' : 'primario'}
              onPress={alternarSeguir} desativado={sigo === null} icone={sigo ? 'check' : 'user'} />
            <Botao titulo="Mensagem" pequeno variante="secundario" icone="mail"
              onPress={() => navigation.navigate('Chat', { username })} />
            <Botao titulo="Denunciar" pequeno variante="perigo" icone="flag" onPress={() => setDenunciar(true)} />
          </View>
        </CabecalhoPerfil>
      )}
      <Destaques username={username} dono={false} aoAbrirPost={id => navigation.navigate('Post', { id })} />
      <AbasPerfil aba={aba} aoMudar={setAba} />
      {aba === 'grade' && (
        <GradePosts posts={posts.dados ?? []} aoAbrir={post => navigation.navigate('Post', { id: post.id })}
          vazio={`@${username} ainda não publicou nada.`} />
      )}
      {aba === 'lista' && posts.dados?.length === 0 && <Text style={base.textoSuave}>@{username} ainda não publicou nada.</Text>}
      {aba === 'lista' && posts.dados?.map(post => (
        <PostCard key={post.id} post={post} eu={eu.username} onCurtir={curtir} onComentar={comentar} noPerfil
          onAbrirPerfil={u => (u === username ? undefined : u === eu.username ? navigation.navigate('Abas', { screen: 'Perfil' }) : navigation.push('Usuario', { username: u }))} />
      ))}

      <ListaPessoas visivel={lista !== null} username={username} abaInicial={lista ?? 'seguidores'} eu={eu.username}
        aoFechar={() => setLista(null)}
        aoAbrirPerfil={u => (u === eu.username ? navigation.navigate('Abas', { screen: 'Perfil' }) : navigation.push('Usuario', { username: u }))} />
      {denunciar && <ModalDenuncia visivel={denunciar} aoFechar={() => setDenunciar(false)} alvo={{ tipo: 'usuario', username }} />}
    </ScrollView>
  )
}

const estilos = StyleSheet.create({
  conteudo: { padding: espaco.lg, gap: espaco.md, paddingBottom: espaco.xxl },
  botoes: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: espaco.sm, marginTop: espaco.md },
})

export default UsuarioScreen
