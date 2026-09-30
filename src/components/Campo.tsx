import React, { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import type { TextInputProps } from 'react-native'
import { cores, espaco, raio } from '../theme/tema'

interface Props extends TextInputProps {
  rotulo?: string
  dica?: string
  /** campo de senha com botão Mostrar/Ocultar */
  senha?: boolean
}

/** Campo de texto padrão do app, com rótulo visível (bom para leitores de tela). */
const Campo = ({ rotulo, dica, senha, style, multiline, ...resto }: Props) => {
  const [mostrar, setMostrar] = useState(false)
  return (
    <View style={estilos.bloco}>
      {rotulo && <Text style={estilos.rotulo}>{rotulo}</Text>}
      <View style={estilos.linha}>
        <TextInput
          placeholderTextColor={cores.textoApagado}
          accessibilityLabel={rotulo ?? resto.placeholder}
          secureTextEntry={senha && !mostrar}
          autoCapitalize={senha ? 'none' : resto.autoCapitalize}
          multiline={multiline}
          style={[estilos.input, multiline && estilos.multilinha, senha && { paddingRight: 84 }, style]}
          {...resto}
        />
        {senha && (
          <Pressable style={estilos.mostrar} onPress={() => setMostrar(m => !m)} accessibilityRole="button"
            accessibilityLabel={mostrar ? 'Ocultar senha' : 'Mostrar senha'} hitSlop={8}>
            <Text style={estilos.mostrarTexto}>{mostrar ? 'Ocultar' : 'Mostrar'}</Text>
          </Pressable>
        )}
      </View>
      {dica && <Text style={estilos.dica}>{dica}</Text>}
    </View>
  )
}

const estilos = StyleSheet.create({
  bloco: { gap: 6 },
  rotulo: { color: cores.textoSuave, fontSize: 13, fontWeight: '600' },
  linha: { justifyContent: 'center' },
  input: {
    minHeight: 48, borderRadius: raio.md, borderWidth: 1, borderColor: cores.bordaForte,
    backgroundColor: 'rgba(255,255,255,0.06)', color: cores.texto, fontSize: 16,
    paddingHorizontal: espaco.md, paddingVertical: 10,
  },
  multilinha: { minHeight: 96, textAlignVertical: 'top' },
  mostrar: { position: 'absolute', right: 10, paddingHorizontal: 8, paddingVertical: 6 },
  mostrarTexto: { color: cores.destaque, fontSize: 13, fontWeight: '700' },
  dica: { color: cores.textoApagado, fontSize: 12 },
})

export default Campo
