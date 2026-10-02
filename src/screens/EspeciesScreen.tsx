import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import type { CompositeScreenProps } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import AnimaisScreen from './AnimaisScreen'
import Botao from '../components/Botao'
import type { AbasParams, RaizParams } from '../types/navegacao'
import { cores, espaco } from '../theme/tema'

type Props = CompositeScreenProps<BottomTabScreenProps<AbasParams, 'Especies'>, NativeStackScreenProps<RaizParams>>

/** Aba "Espécies": o catálogo de animais marinhos, com atalho para Curiosidades. */
const EspeciesScreen = ({ navigation }: Props) => (
  <SafeAreaView style={estilos.tela} edges={['top']}>
    <View style={estilos.topo}>
      <Text style={estilos.titulo} accessibilityRole="header">Espécies</Text>
      <Botao titulo="Curiosidades" icone="waves" pequeno variante="secundario" onPress={() => navigation.navigate('Curiosidades')} />
    </View>
    <AnimaisScreen />
  </SafeAreaView>
)

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  topo: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: espaco.lg, paddingVertical: espaco.md, borderBottomWidth: 1, borderBottomColor: cores.borda,
  },
  titulo: { color: cores.destaque, fontSize: 24, fontWeight: '800' },
})

export default EspeciesScreen
