import React, { useCallback, useState } from 'react'
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { perguntar } from '../utils/perguntar'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import type { CompositeScreenProps } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import CabecalhoPerfil from '../components/CabecalhoPerfil'
import PostCard, { AcaoPost } from '../components/PostCard'
import ListaPessoas from '../components/ListaPessoas'
import TrocarSenha from '../components/TrocarSenha'
import Aparencia from '../components/Aparencia'
import Folha from '../components/Folha'
import FolhaCompartilhar from '../components/FolhaCompartilhar'
import Campo from '../components/Campo'
import Botao from '../components/Botao'
import Icone from '../components/Icone'
import { Aviso, Carregando } from '../components/Estados'
import Destaques from '../components/story/Destaques'
import GradePosts, { AbasPerfil } from '../components/story/GradePosts'
import EscolherDestaque from '../components/story/EscolherDestaque'
import { useAuth, useEu } from '../contexts/AuthContext'
import { useCarregar } from '../hooks/useCarregar'
import { contas, feed, fixarPost } from '../services/api'
import { mensagemDeErro } from '../services/http'
import { erroNoNome } from '../utils/nome'
import { escolherImagem } from '../utils/imagem'
import { alvos } from '../utils/compartilhar'
import type { PerfilStats, Post } from '../types/api'
import type { AbasParams, RaizParams } from '../types/navegacao'
import { base, cores, espaco } from '../theme/tema'

type Props = CompositeScreenProps<BottomTabScreenProps<AbasParams, 'Perfil'>, NativeStackScreenProps<RaizParams>>

/**
 * Meu perfil, igual ao /perfil do site: foto, números e bio; os destaques; e os posts em grade (ou lista).
 * E-mail, senha, aparência, atalhos e "Sair" ficam na engrenagem (Configurações).
 */
const PerfilScreen = ({ navigation }: Props) => {
  const eu = useEu()
  const { ehAdmin, sair, atualizarConta, trocarSenhaPendente, senhaTrocada } = useAuth()
  const perfil = useCarregar<PerfilStats>(() => contas.perfil(eu.username), [eu.username])
  const posts = useCarregar<Post[]>(() => contas.postsDe(eu.username), [eu.username])
  const [erro, setErro] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [lista, setLista] = useState<'seguidores' | 'seguindo' | null>(null)
  const [editando, setEditando] = useState<'bio' | 'nome' | null>(null)
  const [valor, setValor] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [aparencia, setAparencia] = useState(false)
  const [config, setConfig] = useState(false)
  const [compartilhar, setCompartilhar] = useState(false)
  const [aba, setAba] = useState<'grade' | 'lista'>('grade')
  const [guardar, setGuardar] = useState<Post | null>(null)
  const [versaoDestaques, setVersaoDestaques] = useState(0)

  const recarregar = useCallback(() => {
    void perfil.recarregar(true); void posts.recarregar(true); setVersaoDestaques(v => v + 1)
  }, [perfil, posts])

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

  const comentar = async (p: Post, texto: string) => {
    try {
      const c = await feed.comentar(p.id, texto)
      if (!c?.id) return false
      posts.definir(l => l?.map(x => (x.id === p.id ? { ...x, comments: [...x.comments, c] } : x)) ?? null)
      return true
    } catch (e) { setErro(mensagemDeErro(e)); return false }
  }

  const apagar = async (p: Post) => {
    try {
      const r = await feed.apagar(p.id)
      if (r.success) recarregar(); else setErro(r.error ?? 'Não foi possível apagar.')
    } catch (e) { setErro(mensagemDeErro(e)) }
  }

  const fixar = async (p: Post) => {
    try {
      await fixarPost(p.id, !p.fixado)
      setAviso(p.fixado ? 'Post desafixado.' : 'Post fixado no topo do perfil.')
      void posts.recarregar(true)
    } catch (e) { setErro(mensagemDeErro(e)) }
  }

  const confirmarSair = () => perguntar('Sair da conta', 'Deseja sair?', [
    { text: 'Cancelar', style: 'cancel' }, { text: 'Sair', style: 'destructive', onPress: () => void sair() },
  ])

  if (perfil.carregando && !perfil.dados) return <SafeAreaView style={base.tela}><Carregando /></SafeAreaView>

  const p = perfil.dados
  const meusPosts = posts.dados ?? []
  const irPara = (tela: 'Animais' | 'Curiosidades' | 'Sobre' | 'Admin') => { setConfig(false); navigation.navigate(tela) }

  return (
    <SafeAreaView style={base.tela} edges={['top']}>
      <View style={estilos.topo}>
        <Text style={estilos.topoNome} numberOfLines={1}>{eu.username}</Text>
        <Pressable onPress={() => setConfig(true)} hitSlop={10} accessibilityRole="button" accessibilityLabel="Configurações">
          <Icone nome="settings" tamanho={24} cor={cores.textoSuave} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={estilos.conteudo}
        refreshControl={<RefreshControl refreshing={false} onRefresh={recarregar} tintColor={cores.destaque} colors={[cores.destaque]} />}>
        <Aviso tipo="erro" texto={perfil.erro ?? erro} />
        {trocarSenhaPendente && <TrocarSenha obrigatoria aoTrocar={senhaTrocada} />}
        {p && (
          <CabecalhoPerfil username={eu.username} perfil={p} aoTocarFoto={trocarFoto} aoTocarNome={() => abrirEdicao('nome')}
            aoAbrirLista={setLista}>
            <View style={estilos.botoes}>
              <Botao titulo={p.bio ? 'Editar biografia' : 'Escrever biografia'} icone="pencil" variante="secundario" pequeno
                onPress={() => abrirEdicao('bio')} estilo={{ flex: 1 }} />
              <Botao titulo="Compartilhar" icone="share" variante="secundario" pequeno onPress={() => setCompartilhar(true)} estilo={{ flex: 1 }} />
            </View>
          </CabecalhoPerfil>
        )}

        <Destaques username={eu.username} dono posts={meusPosts} atualizar={versaoDestaques}
          aoAbrirPost={id => navigation.navigate('Post', { id })} />

        <AbasPerfil aba={aba} aoMudar={setAba} />
        <Aviso tipo="ok" texto={aviso} />
        {aba === 'grade' ? (
          <GradePosts posts={meusPosts} aoAbrir={post => navigation.navigate('Post', { id: post.id })}
            vazio="Você ainda não publicou nada. Seus posts aparecem aqui." />
        ) : (
          <>
            {meusPosts.length === 0 && <Text style={base.textoSuave}>Você ainda não publicou nada.</Text>}
            {meusPosts.map(post => (
              <PostCard key={post.id} post={post} eu={eu.username} onCurtir={curtir} onComentar={comentar} onApagar={apagar} noPerfil
                onAbrirPerfil={u => (u === eu.username ? undefined : navigation.navigate('Usuario', { username: u }))}
                extras={(
                  <>
                    <AcaoPost icone="pin" texto={post.fixado ? 'Desafixar' : 'Fixar'} ativo={!!post.fixado} onPress={() => void fixar(post)} />
                    <AcaoPost icone="bookmark" texto="Destaque" onPress={() => setGuardar(post)} />
                  </>
                )} />
            ))}
          </>
        )}
      </ScrollView>

      {aparencia && <Aparencia visivel={aparencia} aoFechar={() => setAparencia(false)} />}
      {compartilhar && <FolhaCompartilhar alvo={alvos.perfil(eu.username)} aoFechar={() => setCompartilhar(false)} />}
      {guardar && (
        <EscolherDestaque visivel username={eu.username} item={{ tipo: 'post', id: guardar.id }} aoFechar={() => setGuardar(null)}
          aoConcluir={m => { setAviso(m); setVersaoDestaques(v => v + 1) }} />
      )}

      <ListaPessoas visivel={lista !== null} username={eu.username} abaInicial={lista ?? 'seguidores'} eu={eu.username}
        aoFechar={() => setLista(null)} aoAbrirPerfil={u => navigation.navigate('Usuario', { username: u })} />

      <Folha visivel={config} titulo="Configurações" aoFechar={() => setConfig(false)}>
        {!!p?.email && (
          <View>
            <Text style={base.tituloSecao}>E-mail</Text>
            <Text style={base.texto}>{p.email}</Text>
          </View>
        )}
        {!trocarSenhaPendente && <TrocarSenha obrigatoria={false} aoTrocar={senhaTrocada} />}
        <Botao titulo="Aparência e acessibilidade" icone="sun" variante="texto" onPress={() => { setConfig(false); setAparencia(true) }} estilo={estilos.link} />
        <Botao titulo="Animais marinhos" icone="fish" variante="texto" onPress={() => irPara('Animais')} estilo={estilos.link} />
        <Botao titulo="Curiosidades" icone="waves" variante="texto" onPress={() => irPara('Curiosidades')} estilo={estilos.link} />
        <Botao titulo="Sobre o AquaSite" icone="users" variante="texto" onPress={() => irPara('Sobre')} estilo={estilos.link} />
        {ehAdmin && <Botao titulo="Painel de administração" icone="lock" variante="texto" onPress={() => irPara('Admin')} estilo={estilos.link} />}
        <Botao titulo="Sair da conta" variante="perigo" onPress={() => { setConfig(false); confirmarSair() }} />
      </Folha>

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
  topo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: espaco.lg, paddingVertical: espaco.sm },
  topoNome: { color: cores.texto, fontSize: 19, fontWeight: '800', flex: 1 },
  conteudo: { padding: espaco.lg, paddingTop: espaco.xs, gap: espaco.md, paddingBottom: espaco.xxl },
  botoes: { flexDirection: 'row', gap: espaco.sm, alignSelf: 'stretch', marginTop: espaco.sm },
  link: { alignSelf: 'flex-start' },
})

export default PerfilScreen
