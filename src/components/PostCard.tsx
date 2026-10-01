import React, { memo, useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { perguntar } from '../utils/perguntar'
import Avatar from './Avatar'
import Icone from './Icone'
import ImagemAmpliavel from './ImagemAmpliavel'
import ModalDenuncia from './ModalDenuncia'
import FolhaCompartilhar from './FolhaCompartilhar'
import TextoComLinks from './TextoComLinks'
import type { Post } from '../types/api'
import { cores, espaco, raio } from '../theme/tema'
import { quandoPostou, semArroba } from '../utils/formatar'
import { alvos } from '../utils/compartilhar'
import type { AlvoCompartilhar } from '../utils/compartilhar'

interface Props {
  post: Post
  eu: string | null
  onCurtir?: (post: Post) => void
  onComentar?: (post: Post, texto: string) => Promise<boolean>
  onApagar?: (post: Post) => void
  onAbrirPerfil?: (username: string) => void
  /** abre já com os comentários à mostra (tela de detalhe do post) */
  comentariosAbertos?: boolean
  /** id do comentário que veio num link compartilhado (fica destacado) */
  comentarioDestacado?: number
}

/** Um post do feed geral (mesmos dados e ações do site). */
const PostCard = ({ post, eu, onCurtir, onComentar, onApagar, onAbrirPerfil, comentariosAbertos: abertosDeInicio = false, comentarioDestacado }: Props) => {
  const autor = semArroba(post.user)
  const meu = eu === autor
  const [comentariosAbertos, setComentariosAbertos] = useState(abertosDeInicio)
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [denunciar, setDenunciar] = useState(false)

  const [compartilhar, setCompartilhar] = useState<AlvoCompartilhar | null>(null)

  const confirmarApagar = () => perguntar('Apagar post', 'Apagar este post? Não dá para desfazer.', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Apagar', style: 'destructive', onPress: () => onApagar?.(post) },
  ])

  const comentar = async () => {
    if (!texto.trim() || !onComentar) return
    setEnviando(true)
    if (await onComentar(post, texto.trim())) setTexto('')
    setEnviando(false)
  }

  return (
    <View style={estilos.cartao}>
      <View style={estilos.topo}>
        <Pressable style={estilos.autor} onPress={() => onAbrirPerfil?.(autor)} accessibilityRole="link"
          accessibilityLabel={`Perfil de @${autor}`}>
          <Avatar username={autor} tamanho={36} />
          <View>
            <Text style={estilos.nome}>@{autor}</Text>
            <Text style={estilos.hora}>{quandoPostou(post)}</Text>
          </View>
        </Pressable>
        {meu && onApagar ? (
          <Pressable onPress={confirmarApagar} hitSlop={10} accessibilityRole="button" accessibilityLabel="Apagar post">
            <Icone nome="trash" tamanho={18} cor={cores.textoApagado} />
          </Pressable>
        ) : eu && !meu ? (
          <Pressable onPress={() => setDenunciar(true)} hitSlop={10} accessibilityRole="button" accessibilityLabel="Denunciar post">
            <Icone nome="flag" tamanho={18} cor={cores.textoApagado} />
          </Pressable>
        ) : null}
      </View>

      {post.oculto && (
        <Text style={estilos.oculto}>Oculto do feed por denúncias, aguardando revisão de um administrador. Só você vê este post.</Text>
      )}
      {!!post.content && <TextoComLinks texto={post.content} estilo={estilos.conteudo} />}
      {post.image && (
        <ImagemAmpliavel uri={post.image} descricao={`Foto publicada por @${autor}`} estilo={estilos.imagem} />
      )}

      <View style={estilos.acoes}>
        <Pressable style={[estilos.acao, post.curtiu && estilos.acaoCurtida]} onPress={() => onCurtir?.(post)} disabled={!eu || !onCurtir}
          accessibilityRole="button" accessibilityState={{ selected: !!post.curtiu }}
          accessibilityLabel={`${post.curtiu ? 'Descurtir' : 'Curtir'}. ${post.likes} curtidas`}>
          <Icone nome="heart" tamanho={17} cor={cores.curtida} preenchimento={post.curtiu ? cores.curtida : 'none'} />
          <Text style={[estilos.acaoTexto, { color: cores.curtida }]}>{post.likes}</Text>
        </Pressable>
        <Pressable style={estilos.acao} onPress={() => setComentariosAbertos(a => !a)} accessibilityRole="button"
          accessibilityLabel={`Comentários: ${post.comments.length}`} accessibilityState={{ expanded: comentariosAbertos }}>
          <Icone nome="message" tamanho={17} cor={cores.textoSuave} />
          <Text style={estilos.acaoTexto}>{post.comments.length}</Text>
        </Pressable>
        <Pressable style={estilos.acao} onPress={() => setCompartilhar(alvos.post(post))} accessibilityRole="button" accessibilityLabel="Compartilhar post">
          <Icone nome="share" tamanho={17} cor={cores.textoSuave} />
          <Text style={estilos.acaoTexto}>Compartilhar</Text>
        </Pressable>
      </View>

      {comentariosAbertos && (
        <View style={estilos.comentarios}>
          {post.comments.length === 0 && <Text style={estilos.hora}>Nenhum comentário ainda.</Text>}
          {post.comments.map(c => (
            <View key={c.id} style={[estilos.linhaComentario, c.id === comentarioDestacado && estilos.destacado]}>
              <Text style={[estilos.comentario, { flex: 1 }]}>
                <Text style={estilos.nome} onPress={() => onAbrirPerfil?.(c.user)}>{c.user}: </Text>{c.text}
              </Text>
              <Pressable onPress={() => setCompartilhar(alvos.comentario(post.id, c))} hitSlop={8}
                accessibilityRole="button" accessibilityLabel={'Compartilhar comentário de ' + c.user}>
                <Icone nome="share" tamanho={15} cor={cores.textoApagado} />
              </Pressable>
            </View>
          ))}
          {eu && onComentar && (
            <View style={estilos.novoComentario}>
              <TextInput value={texto} onChangeText={setTexto} placeholder="Escreva um comentário..." maxLength={500}
                placeholderTextColor={cores.textoApagado} style={estilos.inputComentario} accessibilityLabel="Novo comentário"
                onSubmitEditing={comentar} returnKeyType="send" />
              <Pressable onPress={comentar} disabled={enviando || !texto.trim()} style={estilos.enviar}
                accessibilityRole="button" accessibilityLabel="Enviar comentário">
                <Icone nome="arrow-right" tamanho={18} cor={cores.fundo} />
              </Pressable>
            </View>
          )}
        </View>
      )}

      {compartilhar && <FolhaCompartilhar alvo={compartilhar} aoFechar={() => setCompartilhar(null)} />}
      {denunciar && (
        <ModalDenuncia visivel={denunciar} aoFechar={() => setDenunciar(false)} alvo={{ tipo: 'post', postId: post.id }} />
      )}
    </View>
  )
}

const estilos = StyleSheet.create({
  cartao: {
    backgroundColor: cores.painel, borderRadius: raio.lg, borderWidth: 1, borderColor: cores.borda,
    padding: espaco.lg, gap: espaco.md,
  },
  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  autor: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm, flexShrink: 1 },
  nome: { color: cores.destaque, fontWeight: '700', fontSize: 14 },
  hora: { color: cores.textoApagado, fontSize: 12 },
  oculto: { color: cores.atencao, fontSize: 13 },
  conteudo: { color: cores.texto, fontSize: 15, lineHeight: 22 },
  imagem: { width: '100%', aspectRatio: 4 / 3, borderRadius: raio.md, backgroundColor: cores.fundo3 },
  acoes: { flexDirection: 'row', gap: espaco.sm, flexWrap: 'wrap' },
  acao: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, minHeight: 36,
    borderRadius: raio.pilula, borderWidth: 1, borderColor: cores.borda, backgroundColor: 'rgba(255,255,255,0.04)',
  },
  acaoCurtida: { borderColor: 'rgba(255,107,157,0.4)', backgroundColor: 'rgba(255,107,157,0.08)' },
  acaoTexto: { color: cores.textoSuave, fontSize: 13, fontWeight: '600' },
  comentarios: { gap: espaco.sm, borderTopWidth: 1, borderTopColor: cores.borda, paddingTop: espaco.md },
  comentario: { color: cores.texto, fontSize: 14, lineHeight: 20 },
  linhaComentario: { flexDirection: 'row', alignItems: 'flex-start', gap: espaco.sm, borderRadius: raio.sm, padding: 4 },
  destacado: { backgroundColor: cores.destaqueFundo, borderWidth: 1, borderColor: cores.destaque },
  novoComentario: { flexDirection: 'row', gap: espaco.sm, alignItems: 'center' },
  inputComentario: {
    flex: 1, minHeight: 42, borderRadius: raio.pilula, borderWidth: 1, borderColor: cores.bordaForte,
    color: cores.texto, paddingHorizontal: 14, backgroundColor: 'rgba(255,255,255,0.05)',
  },
  enviar: { width: 42, height: 42, borderRadius: 21, backgroundColor: cores.destaque, alignItems: 'center', justifyContent: 'center' },
})

export default memo(PostCard)
