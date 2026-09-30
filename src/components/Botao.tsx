import React from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import Icone from './Icone'
import type { NomeIcone } from './Icone'
import { cores, espaco, raio } from '../theme/tema'

type Variante = 'primario' | 'secundario' | 'perigo' | 'texto'

interface Props {
  titulo: string
  onPress: () => void
  variante?: Variante
  icone?: NomeIcone
  carregando?: boolean
  desativado?: boolean
  pequeno?: boolean
  estilo?: StyleProp<ViewStyle>
  rotuloAcessivel?: string
}

const Botao = ({ titulo, onPress, variante = 'primario', icone, carregando, desativado, pequeno, estilo, rotuloAcessivel }: Props) => {
  const corTexto = variante === 'primario' ? cores.fundo : variante === 'perigo' ? cores.erro : cores.destaque
  const inativo = desativado || carregando
  return (
    <Pressable
      onPress={onPress}
      disabled={inativo}
      accessibilityRole="button"
      accessibilityLabel={rotuloAcessivel ?? titulo}
      accessibilityState={{ disabled: !!inativo, busy: !!carregando }}
      style={({ pressed }) => [
        estilos.base,
        pequeno && estilos.pequeno,
        estilos[variante],
        (pressed || inativo) && { opacity: inativo ? 0.55 : 0.8 },
        estilo,
      ]}
    >
      {carregando ? <ActivityIndicator color={corTexto} /> : (
        <View style={estilos.conteudo}>
          {icone && <Icone nome={icone} tamanho={pequeno ? 15 : 18} cor={corTexto} />}
          <Text style={[estilos.rotulo, pequeno && estilos.rotuloPequeno, { color: corTexto }]}>{titulo}</Text>
        </View>
      )}
    </Pressable>
  )
}

const estilos = StyleSheet.create({
  base: {
    minHeight: 48, borderRadius: raio.pilula, paddingHorizontal: espaco.xl,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'transparent',
  },
  pequeno: { minHeight: 36, paddingHorizontal: espaco.lg },
  primario: { backgroundColor: cores.destaque },
  secundario: { backgroundColor: cores.destaqueFundo, borderColor: 'rgba(0,212,255,0.35)' },
  perigo: { backgroundColor: cores.erroFundo, borderColor: 'rgba(255,107,107,0.35)' },
  texto: { backgroundColor: 'transparent', paddingHorizontal: espaco.sm },
  conteudo: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  rotulo: { fontSize: 15, fontWeight: '700' },
  rotuloPequeno: { fontSize: 13 },
})

export default Botao
