import React, { useState } from 'react'
import { RefreshControl, ScrollView, StyleSheet } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import PostCard from '../components/PostCard'
import { Aviso, Carregando, EstadoVazio } from '../components/Estados'
import { useEu } from '../contexts/AuthContext'
import { useCarregar } from '../hooks/useCarregar'
import { feed } from '../services/api'
import { mensagemDeErro } from '../services/http'
import type { Post } from '../types/api'
import type { RaizParams } from '../types/navegacao'
import { base, espaco } from '../theme/tema'

type Props = NativeStackScreenProps<RaizParams, 'Post'>

/**
 * Um post só (GET /api/posts/{id}), com curtidas e comentários abertos.
 * É aberto ao tocar numa notificação de curtida, comentário ou moderação, num aviso push
 * ou num link compartilhado (/post/12?comentario=40 destaca o comentário).
 */
const PostScreen = ({ route, navigation }: Props) => {
  const { id, comentarioId } = route.params
  const eu = useEu()
  const post = useCarregar<Post>(() => feed.obter(id), [id])
  const [erro, setErro] = useState<string | null>(null)

  const atualizar = (dados: Partial<Post>) => post.definir(p => (p ? { ...p, ...dados } : p))

  const curtir = async (p: Post) => {
    const antes = { likes: p.likes, curtiu: p.curtiu }
    atualizar({ curtiu: !p.curtiu, likes: p.likes + (p.curtiu ? -1 : 1) })
    try {
      const r = p.curtiu ? await feed.descurtir(p.id) : await feed.curtir(p.id)
      atualizar({ likes: r.likes, curtiu: r.curtiu })
    } catch (e) {
      atualizar(antes)
      setErro(mensagemDeErro(e))
    }
  }

  const comentar = async (p: Post, texto: string) => {
    try {
      const c = await feed.comentar(p.id, texto)
      post.definir(atual => (atual ? { ...atual, comments: [...atual.comments, c] } : atual))
      return true
    } catch (e) {
      setErro(mensagemDeErro(e))
      return false
    }
  }

  const apagar = async (p: Post) => {
    try {
      const r = await feed.apagar(p.id)
      if (r.success) navigation.goBack()
      else setErro(r.error ?? 'Não foi possível apagar.')
    } catch (e) {
      setErro(mensagemDeErro(e))
    }
  }

  if (post.carregando && !post.dados) return <ScrollView style={base.tela}><Carregando /></ScrollView>

  // 404: o post foi apagado (ou está oculto para quem não é o autor)
  const sumiu = !post.dados && post.erroStatus === 404

  return (
    <ScrollView style={base.tela} contentContainerStyle={estilos.conteudo}
      refreshControl={<RefreshControl refreshing={false} onRefresh={() => void post.recarregar(true)} />}>
      <Aviso tipo="erro" texto={sumiu ? null : erro ?? post.erro} />
      {sumiu && <EstadoVazio icone="file" texto="Este post não está mais disponível. Ele pode ter sido apagado." />}
      {post.dados && (
        <>
          {post.dados.oculto && (
            <Aviso tipo="atencao" texto="Este post está oculto do feed por denúncias até a revisão de um administrador." />
          )}
          <PostCard post={post.dados} eu={eu.username} comentariosAbertos comentarioDestacado={comentarioId}
            onCurtir={p => void curtir(p)} onComentar={comentar} onApagar={p => void apagar(p)}
            onAbrirPerfil={u => (u === eu.username ? navigation.navigate('Abas', { screen: 'Perfil' }) : navigation.navigate('Usuario', { username: u }))} />
        </>
      )}
    </ScrollView>
  )
}

const estilos = StyleSheet.create({
  conteudo: { padding: espaco.lg, gap: espaco.md },
})

export default PostScreen
