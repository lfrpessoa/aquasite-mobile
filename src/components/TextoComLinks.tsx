import React from 'react'
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native'
import type { StyleProp, TextStyle } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import Icone from './Icone'
import { lerLinkAquaSite } from '../utils/compartilhar'
import type { LinkInterno } from '../utils/compartilhar'
import type { RaizParams } from '../types/navegacao'
import { cores, raio } from '../theme/tema'

const URL_REGEX = /(https?:\/\/[^\s]+)/g

interface Props {
  texto: string
  estilo?: StyleProp<TextStyle>
  /** está no balão azul das minhas mensagens (o botão fica branco) */
  noMeuBalao?: boolean
}

/** Abre, dentro do app, a tela de um link do AquaSite. */
export function abrirLinkInterno(navigation: NativeStackNavigationProp<RaizParams>, l: LinkInterno) {
  if (l.tela === 'Post') navigation.navigate('Post', { id: l.id, comentarioId: l.comentarioId })
  else if (l.tela === 'FeedComunidade') navigation.navigate('FeedComunidade', { tipo: l.tipo, id: l.id, postId: l.postId, comentarioId: l.comentarioId })
  else if (l.tela === 'Usuario') navigation.navigate('Usuario', { username: l.username })
  else navigation.navigate('Abas', { screen: 'Comunidade', params: { abrir: { tipo: l.tipo, id: l.id } } })
}

/** Botão "Abrir post" / "Abrir comunidade" no lugar de um link do AquaSite. */
const BotaoLinkInterno = ({ link, noMeuBalao }: { link: LinkInterno; noMeuBalao: boolean }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RaizParams>>()
  return (
    <Pressable onPress={() => abrirLinkInterno(navigation, link)}
      style={[estilos.botao, noMeuBalao && estilos.botaoNoMeuBalao]} accessibilityRole="link" accessibilityLabel={link.rotulo}>
      <Icone nome="link" tamanho={14} cor={noMeuBalao ? cores.branco : cores.destaque} />
      <Text style={[estilos.botaoTexto, noMeuBalao && { color: cores.branco }]}>{link.rotulo}</Text>
    </Pressable>
  )
}

/**
 * Texto com links clicáveis (igual ao site). Links do AquaSite (post, comentário, comunidade)
 * viram um botão "Abrir post" que abre a tela do app; os outros abrem no navegador.
 */
const TextoComLinks = ({ texto, estilo, noMeuBalao = false }: Props) => {
  const partes = texto.split(URL_REGEX)
  if (partes.length === 1) return <Text style={estilo} selectable>{texto}</Text>

  // links internos ficam numa linha própria, como um botão; o resto do texto segue normal
  const blocos: React.ReactNode[] = []
  let corrido: React.ReactNode[] = []
  const fecharTexto = () => {
    if (corrido.length) blocos.push(<Text key={`t${blocos.length}`} style={estilo} selectable>{corrido}</Text>)
    corrido = []
  }

  partes.forEach((parte, i) => {
    if (!/^https?:\/\//.test(parte)) {
      if (parte) corrido.push(parte)
      return
    }
    const limpo = parte.replace(/[.,;:!?)]+$/, '')
    const resto = parte.slice(limpo.length)
    const interno = lerLinkAquaSite(limpo)
    if (interno) {
      // a quebra de linha antes do link sobraria no fim do texto, já que o botão vai numa linha própria
      if (corrido.length) {
        const ultimo = corrido[corrido.length - 1]
        if (typeof ultimo === 'string') corrido[corrido.length - 1] = ultimo.replace(/\n$/, '')
      }
      fecharTexto()
      blocos.push(<BotaoLinkInterno key={`l${i}`} link={interno} noMeuBalao={noMeuBalao} />)
      if (resto) corrido.push(resto)
      return
    }
    corrido.push(
      <Text key={`a${i}`} style={[estilos.link, noMeuBalao && { color: cores.branco }]} onPress={() => void Linking.openURL(limpo)}
        accessibilityRole="link">{limpo}</Text>,
      resto,
    )
  })
  fecharTexto()
  return <View style={estilos.coluna}>{blocos}</View>
}

const estilos = StyleSheet.create({
  coluna: { gap: 6, alignItems: 'flex-start' },
  link: { color: cores.destaque, textDecorationLine: 'underline', fontWeight: '600' },
  botao: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, minHeight: 34,
    borderRadius: raio.pilula, borderWidth: 1, borderColor: cores.destaque, backgroundColor: cores.destaqueFundo,
  },
  botaoNoMeuBalao: { borderColor: 'rgba(255,255,255,0.5)', backgroundColor: 'rgba(255,255,255,0.18)' },
  botaoTexto: { color: cores.destaque, fontWeight: '700', fontSize: 13 },
})

export default TextoComLinks
