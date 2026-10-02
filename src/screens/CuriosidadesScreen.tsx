import React, { useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import Folha from '../components/Folha'
import Icone from '../components/Icone'
import { DICAS, POR_QUE_PRESERVAR } from '../data/conteudo'
import type { Dica } from '../data/conteudo'
import { ANIMAIS, GRUPOS } from '../data/animais'
import type { RaizParams } from '../types/navegacao'
import { base, cores, espaco, raio } from '../theme/tema'

type Props = NativeStackScreenProps<RaizParams, 'Curiosidades'>

/** Curiosidades: por que preservar, seis dicas de conservação (mesmo conteúdo do site) e atalho para os animais marinhos. */
const CuriosidadesScreen = ({ navigation }: Props) => {
  const [dica, setDica] = useState<Dica | null>(null)
  return (
    <ScrollView style={base.tela} contentContainerStyle={estilos.conteudo}>
      <View style={estilos.capa}>
        <Text style={estilos.titulo} accessibilityRole="header">Preserve a vida marinha</Text>
        <Text style={estilos.subtitulo}>Nossos oceanos abrigam uma vida incrível. Pequenas atitudes podem gerar grandes mudanças.</Text>
      </View>

      <Pressable style={({ pressed }) => [estilos.animais, pressed && { opacity: 0.8 }]} onPress={() => navigation.navigate('Animais')}
        accessibilityRole="button" accessibilityLabel={`Animais marinhos: ${ANIMAIS.length} espécies. Abrir catálogo`}>
        <View style={{ flex: 1 }}>
          <Text style={estilos.dicaTitulo}>Animais marinhos</Text>
          <Text style={base.textoSuave}>{ANIMAIS.length} espécies em {GRUPOS.length} grupos, com curiosidades de cada uma</Text>
        </View>
        <Icone nome="arrow-right" tamanho={18} cor={cores.destaque} />
      </Pressable>

      <Text style={base.tituloSecao}>Por que preservar?</Text>
      <View style={estilos.grade}>
        {POR_QUE_PRESERVAR.map(item => (
          <View key={item.titulo} style={estilos.porque}>
            <Text style={estilos.porqueTitulo}>{item.titulo}</Text>
            <Text style={estilos.porqueTexto}>{item.texto}</Text>
          </View>
        ))}
      </View>

      <Text style={[base.tituloSecao, { marginTop: espaco.md }]}>O oceano precisa de você</Text>
      {DICAS.map(d => (
        <Pressable key={d.titulo} style={({ pressed }) => [estilos.dica, pressed && { opacity: 0.75 }]} onPress={() => setDica(d)}
          accessibilityRole="button" accessibilityLabel={`${d.titulo}. ${d.texto}. Toque para saber mais`}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={estilos.dicaTitulo}>{d.titulo}</Text>
            <Text style={base.textoSuave}>{d.texto}</Text>
          </View>
          <Icone nome="chevron-down" tamanho={18} cor={cores.destaque} />
        </Pressable>
      ))}

      <Folha visivel={dica !== null} titulo={dica?.titulo ?? ''} aoFechar={() => setDica(null)}>
        <Text style={base.tituloSecao}>Por que fazer?</Text>
        <Text style={base.texto}>{dica?.porQue}</Text>
        <Text style={[base.tituloSecao, { marginTop: espaco.md }]}>Como ajudar?</Text>
        <Text style={base.texto}>{dica?.comoAjudar}</Text>
      </Folha>
    </ScrollView>
  )
}

const estilos = StyleSheet.create({
  conteudo: { padding: espaco.lg, gap: espaco.md, paddingBottom: espaco.xxl },
  capa: { backgroundColor: cores.fundo3, borderRadius: raio.lg + 4, padding: espaco.xl, gap: espaco.sm },
  titulo: { color: cores.destaque, fontSize: 28, fontWeight: '800' },
  subtitulo: { color: cores.textoSuave, fontSize: 15, lineHeight: 22 },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.sm },
  porque: {
    width: '48%', flexGrow: 1, backgroundColor: cores.painel, borderRadius: raio.lg, borderWidth: 1,
    borderColor: cores.borda, padding: espaco.md, gap: 4,
  },
  porqueTitulo: { color: cores.destaque, fontWeight: '700', fontSize: 15 },
  porqueTexto: { color: cores.textoSuave, fontSize: 13, lineHeight: 19 },
  dica: {
    flexDirection: 'row', alignItems: 'center', gap: espaco.md, backgroundColor: cores.painel, borderRadius: raio.lg,
    borderWidth: 1, borderColor: cores.borda, padding: espaco.lg,
  },
  dicaTitulo: { color: cores.texto, fontWeight: '700', fontSize: 16 },
  animais: {
    flexDirection: 'row', alignItems: 'center', gap: espaco.md, padding: espaco.lg, borderRadius: raio.lg,
    backgroundColor: cores.destaqueFundo, borderWidth: 1, borderColor: 'rgba(0,212,255,0.35)',
  },
})

export default CuriosidadesScreen
