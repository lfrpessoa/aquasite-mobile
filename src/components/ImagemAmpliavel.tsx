import React, { useState } from 'react'
import { Modal, Pressable, StyleSheet, View } from 'react-native'
import { Image } from 'expo-image'
import type { ImageStyle, StyleProp } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Icone from './Icone'
import { preferencias } from '../theme/cores'

interface Props {
  uri: string
  descricao: string
  estilo?: StyleProp<ImageStyle>
}

/**
 * Foto de post, mensagem ou aviso: aparece cortada e abre inteira ao tocar (igual ao site).
 * expo-image guarda a foto no disco do aparelho: ela não é baixada de novo e aparece mesmo sem conexão.
 */
const ImagemAmpliavel = ({ uri, descricao, estilo }: Props) => {
  const [aberta, setAberta] = useState(false)
  const margens = useSafeAreaInsets()
  return (
    <>
      <Pressable onPress={() => setAberta(true)} accessibilityRole="imagebutton"
        accessibilityLabel={`${descricao}. Toque para ver inteira`}>
        <Image source={{ uri }} style={estilo} contentFit="cover" cachePolicy="memory-disk" transition={preferencias.menosMovimento ? 0 : 150} accessibilityIgnoresInvertColors />
      </Pressable>
      <Modal visible={aberta} transparent animationType={preferencias.menosMovimento ? 'none' : 'fade'} onRequestClose={() => setAberta(false)} statusBarTranslucent>
        <View style={estilos.fundo}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setAberta(false)} accessibilityLabel="Fechar imagem" />
          <Image source={{ uri }} style={estilos.imagem} contentFit="contain" cachePolicy="memory-disk" accessibilityLabel={descricao} />
          <Pressable onPress={() => setAberta(false)} style={[estilos.fechar, { top: margens.top + 12 }]}
            accessibilityRole="button" accessibilityLabel="Fechar imagem" hitSlop={10}>
            <Icone nome="x" tamanho={22} cor="#fff" />
          </Pressable>
        </View>
      </Modal>
    </>
  )
}

const estilos = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: 'rgba(2,8,16,0.95)', alignItems: 'center', justifyContent: 'center' },
  imagem: { width: '100%', height: '85%' },
  fechar: {
    position: 'absolute', right: 16, width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center',
  },
})

export default ImagemAmpliavel
