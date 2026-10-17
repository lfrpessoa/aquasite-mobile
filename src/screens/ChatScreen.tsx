import React, { useEffect, useRef, useState } from 'react'
import { ActionSheetIOS, FlatList, Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { perguntar } from '../utils/perguntar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import Icone from '../components/Icone'
import ImagemAmpliavel from '../components/ImagemAmpliavel'
import TextoComLinks from '../components/TextoComLinks'
import RespostaDeStory from '../components/story/RespostaDeStory'
import { Aviso, Carregando } from '../components/Estados'
import { useEu } from '../contexts/AuthContext'
import { useCarregar } from '../hooks/useCarregar'
import { mensagens } from '../services/api'
import { mensagemDeErro } from '../services/http'
import { escolherImagem } from '../utils/imagem'
import { hora } from '../utils/formatar'
import type { EscopoApagar, Mensagem } from '../types/api'
import type { RaizParams } from '../types/navegacao'
import { base, cores, espaco, raio } from '../theme/tema'

type Props = NativeStackScreenProps<RaizParams, 'Chat'>

/** Conversa com uma pessoa. Atualiza a cada 4 s (como o site); segure uma mensagem para apagar. */
const ChatScreen = ({ route, navigation }: Props) => {
  const { username } = route.params
  const eu = useEu()
  const margens = useSafeAreaInsets()
  const conversa = useCarregar<Mensagem[]>(() => mensagens.conversa(eu.username, username), [username], 4000)
  const [texto, setTexto] = useState('')
  const [foto, setFoto] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const listaRef = useRef<FlatList<Mensagem>>(null)

  useEffect(() => {
    navigation.setOptions({
      title: `@${username}`,
      headerRight: () => (
        <Pressable onPress={() => navigation.navigate('Usuario', { username })} hitSlop={10}
          accessibilityRole="button" accessibilityLabel={`Ver perfil de @${username}`}>
          <Icone nome="user" tamanho={22} cor={cores.destaque} />
        </Pressable>
      ),
    })
  }, [navigation, username])

  const enviar = async () => {
    if ((!texto.trim() && !foto) || enviando) return
    setEnviando(true)
    setErro(null)
    try {
      const m = await mensagens.enviar(username, texto.trim(), foto)
      conversa.definir(l => [...(l ?? []), m])
      setTexto('')
      setFoto(null)
      setTimeout(() => listaRef.current?.scrollToEnd({ animated: true }), 100)
    } catch (e) {
      setErro(mensagemDeErro(e))
    }
    setEnviando(false)
  }

  const apagar = async (m: Mensagem, escopo: EscopoApagar) => {
    try {
      const r = await mensagens.apagar(m.id, escopo)
      if (!r.success) { setErro(r.error ?? 'Não foi possível apagar.'); return }
      conversa.definir(l => escopo === 'me'
        ? (l ?? []).filter(x => x.id !== m.id)
        : (l ?? []).map(x => (x.id === m.id ? { ...x, content: '', image: null, deletedForAll: true } : x)))
    } catch (e) { setErro(mensagemDeErro(e)) }
  }

  const menu = (m: Mensagem) => {
    const minha = m.sender === eu.username
    const podeTodos = minha && !m.deletedForAll
    const opcoes = ['Apagar para mim', ...(podeTodos ? ['Apagar para todos'] : []), 'Cancelar']
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: opcoes, destructiveButtonIndex: podeTodos ? 1 : 0, cancelButtonIndex: opcoes.length - 1 },
        i => { if (i === 0) void apagar(m, 'me'); else if (podeTodos && i === 1) void apagar(m, 'all') })
    } else {
      perguntar('Apagar mensagem', undefined, [
        { text: 'Apagar para mim', onPress: () => void apagar(m, 'me') },
        ...(podeTodos ? [{ text: 'Apagar para todos', style: 'destructive' as const, onPress: () => void apagar(m, 'all') }] : []),
        { text: 'Cancelar', style: 'cancel' as const },
      ])
    }
  }

  const escolher = async () => {
    try { const f = await escolherImagem(); if (f) setFoto(f) } catch (e) { setErro(mensagemDeErro(e)) }
  }

  const renderizar = ({ item: m }: { item: Mensagem }) => {
    const minha = m.sender === eu.username
    const quando = hora(m.createdAt ?? m.created_at)
    return (
      <Pressable onLongPress={() => menu(m)} delayLongPress={350} style={[estilos.linha, minha ? estilos.direita : estilos.esquerda]}
        accessibilityLabel={`${minha ? 'Você' : `@${m.sender}`}: ${m.deletedForAll ? 'mensagem apagada' : m.content || 'imagem'}, ${quando}`}
        accessibilityHint="Segure para apagar">
        <View style={[estilos.coluna, { alignItems: minha ? 'flex-end' : 'flex-start' }]}>
        {!!m.storyImagem && !m.deletedForAll && <RespostaDeStory uri={m.storyImagem} minha={minha} outro={m.receiver} />}
        <View style={[estilos.bolha, minha ? estilos.minha : estilos.dele]}>
          {m.deletedForAll ? (
            <Text style={estilos.apagada}>{minha ? 'Você apagou esta mensagem' : 'Esta mensagem foi apagada'}</Text>
          ) : (
            <>
              {m.image && <ImagemAmpliavel uri={m.image} descricao={`Imagem enviada por @${m.sender}`} estilo={estilos.imagem} />}
              {!!m.content && <TextoComLinks texto={m.content} estilo={[estilos.texto, minha && { color: '#fff' }]} noMeuBalao={minha} />}
            </>
          )}
          <Text style={[estilos.hora, minha && { color: 'rgba(255,255,255,0.75)' }]}>{quando}</Text>
        </View>
        </View>
      </Pressable>
    )
  }

  return (
    <KeyboardAvoidingView style={base.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      {conversa.carregando && !conversa.dados ? <Carregando /> : (
        <FlatList
          ref={listaRef}
          data={conversa.dados ?? []}
          keyExtractor={m => String(m.id)}
          renderItem={renderizar}
          contentContainerStyle={estilos.lista}
          onContentSizeChange={() => listaRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={<Text style={[base.textoSuave, { textAlign: 'center', marginTop: 40 }]}>Diga oi para @{username}!</Text>}
        />
      )}
      <Aviso tipo="erro" texto={erro ?? conversa.erro} />
      {foto && (
        <View style={estilos.previa}>
          <Image source={{ uri: foto }} style={estilos.previaImg} accessibilityLabel="Imagem escolhida" />
          <Pressable onPress={() => setFoto(null)} accessibilityRole="button" accessibilityLabel="Tirar imagem" hitSlop={8}>
            <Icone nome="x" tamanho={20} cor={cores.textoSuave} />
          </Pressable>
        </View>
      )}
      <View style={[estilos.barra, { paddingBottom: margens.bottom + espaco.sm }]}>
        <Pressable onPress={escolher} style={estilos.botaoFoto} accessibilityRole="button" accessibilityLabel="Enviar imagem">
          <Icone nome="camera" tamanho={20} cor={cores.destaque} />
        </Pressable>
        <TextInput value={texto} onChangeText={setTexto} placeholder={`Mensagem para @${username}...`} multiline maxLength={2000}
          placeholderTextColor={cores.textoApagado} style={estilos.input} accessibilityLabel="Mensagem" />
        <Pressable onPress={enviar} disabled={enviando || (!texto.trim() && !foto)} style={[estilos.enviar, (enviando || (!texto.trim() && !foto)) && { opacity: 0.5 }]}
          accessibilityRole="button" accessibilityLabel="Enviar">
          <Icone nome="arrow-right" tamanho={20} cor={cores.fundo} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}

const estilos = StyleSheet.create({
  lista: { padding: espaco.lg, gap: espaco.sm, flexGrow: 1 },
  linha: { flexDirection: 'row' },
  direita: { justifyContent: 'flex-end' },
  esquerda: { justifyContent: 'flex-start' },
  coluna: { maxWidth: '80%' },
  bolha: { maxWidth: '100%', borderRadius: raio.lg, paddingHorizontal: 12, paddingVertical: 8, gap: 4 },
  minha: { backgroundColor: cores.destaqueEscuro, borderBottomRightRadius: 4 },
  dele: { backgroundColor: cores.painelClaro, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: cores.borda },
  texto: { color: cores.texto, fontSize: 15, lineHeight: 21 },
  apagada: { color: cores.textoApagado, fontStyle: 'italic', fontSize: 14 },
  hora: { color: cores.textoApagado, fontSize: 11, alignSelf: 'flex-end' },
  imagem: { width: 220, height: 220, borderRadius: raio.md },
  previa: { flexDirection: 'row', alignItems: 'center', gap: espaco.md, paddingHorizontal: espaco.lg, paddingTop: espaco.sm },
  previaImg: { width: 64, height: 64, borderRadius: raio.sm },
  barra: {
    flexDirection: 'row', alignItems: 'flex-end', gap: espaco.sm, paddingHorizontal: espaco.md, paddingTop: espaco.sm,
    borderTopWidth: 1, borderTopColor: cores.borda, backgroundColor: cores.fundo2,
  },
  botaoFoto: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: cores.destaqueFundo },
  input: {
    flex: 1, minHeight: 44, maxHeight: 120, borderRadius: 22, borderWidth: 1, borderColor: cores.bordaForte,
    color: cores.texto, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, backgroundColor: 'rgba(255,255,255,0.05)',
  },
  enviar: { width: 44, height: 44, borderRadius: 22, backgroundColor: cores.destaque, alignItems: 'center', justifyContent: 'center' },
})

export default ChatScreen
