import React from 'react'
import type { ReactNode } from 'react'
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Icone from './Icone'
import { cores, espaco, raio } from '../theme/tema'
import { preferencias } from '../theme/cores'

interface Props {
  visivel: boolean
  titulo: string
  aoFechar: () => void
  children: ReactNode
}

/** "Folha" que sobe da parte de baixo da tela — o jeito de celular para janelas e formulários. */
const Folha = ({ visivel, titulo, aoFechar, children }: Props) => {
  const margens = useSafeAreaInsets()
  return (
    <Modal visible={visivel} transparent animationType={preferencias.menosMovimento ? 'none' : 'slide'} onRequestClose={aoFechar} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={estilos.fundo}>
        <Pressable style={StyleSheet.absoluteFill} onPress={aoFechar} accessibilityLabel="Fechar" />
        <View style={[estilos.folha, { paddingBottom: margens.bottom + espaco.lg }]} accessibilityViewIsModal>
          <View style={estilos.alca} />
          <View style={estilos.topo}>
            <Text style={estilos.titulo} accessibilityRole="header">{titulo}</Text>
            <Pressable onPress={aoFechar} hitSlop={12} accessibilityRole="button" accessibilityLabel="Fechar">
              <Icone nome="x" tamanho={22} cor={cores.textoSuave} />
            </Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: espaco.md }}>
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const estilos = StyleSheet.create({
  fundo: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.55)' },
  folha: {
    maxHeight: '88%', backgroundColor: cores.fundo2, borderTopLeftRadius: raio.lg + 6, borderTopRightRadius: raio.lg + 6,
    paddingHorizontal: espaco.lg, paddingTop: espaco.sm, borderWidth: 1, borderColor: cores.borda,
  },
  alca: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: cores.bordaForte, marginBottom: espaco.sm },
  topo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: espaco.md },
  titulo: { color: cores.texto, fontSize: 18, fontWeight: '700', flex: 1 },
})

export default Folha
