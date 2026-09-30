import React from 'react'
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native'
import { cores, espaco, raio } from '../theme/tema'

export interface Opcao<T extends string> {
  valor: T
  label: string
}

interface Props<T extends string> {
  opcoes: Opcao<T>[]
  valor: T
  aoMudar: (v: T) => void
  rolavel?: boolean
  rotulo?: string
}

/** Escolha única em "pílulas" (substitui o <select> do site, que é ruim de usar no celular). */
function Chips<T extends string>({ opcoes, valor, aoMudar, rolavel = true, rotulo }: Props<T>) {
  const itens = opcoes.map(o => {
    const ativo = o.valor === valor
    return (
      <Pressable key={o.valor} onPress={() => aoMudar(o.valor)} style={[estilos.chip, ativo && estilos.ativo]}
        accessibilityRole="radio" accessibilityState={{ selected: ativo }} accessibilityLabel={o.label}>
        <Text style={[estilos.texto, ativo && estilos.textoAtivo]}>{o.label}</Text>
      </Pressable>
    )
  })
  return rolavel ? (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.linha}
      accessibilityRole="radiogroup" accessibilityLabel={rotulo}>{itens}</ScrollView>
  ) : (
    <ScrollView scrollEnabled={false} contentContainerStyle={[estilos.linha, estilos.quebra]}
      accessibilityRole="radiogroup" accessibilityLabel={rotulo}>{itens}</ScrollView>
  )
}

const estilos = StyleSheet.create({
  linha: { gap: espaco.sm, paddingVertical: 2 },
  quebra: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: raio.pilula, borderWidth: 1,
    borderColor: cores.bordaForte, backgroundColor: 'rgba(255,255,255,0.04)', minHeight: 36, justifyContent: 'center',
  },
  ativo: { backgroundColor: cores.destaque, borderColor: cores.destaque },
  texto: { color: cores.textoSuave, fontSize: 13, fontWeight: '600' },
  textoAtivo: { color: cores.fundo },
})

export default Chips
