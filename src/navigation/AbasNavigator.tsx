import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Icone from '../components/Icone'
import type { NomeIcone } from '../components/Icone'
import FeedScreen from '../screens/FeedScreen'
import MapaScreen from '../screens/MapaScreen'
import EspeciesScreen from '../screens/EspeciesScreen'
import ComunidadeScreen from '../screens/ComunidadeScreen'
import ConversasScreen from '../screens/ConversasScreen'
import PerfilScreen from '../screens/PerfilScreen'
import type { AbasParams } from '../types/navegacao'
import { cores } from '../theme/tema'
import { preferencias } from '../theme/cores'
import { useAuth } from '../contexts/AuthContext'

const Abas = createBottomTabNavigator<AbasParams>()

const ICONES: Record<keyof AbasParams, NomeIcone> = {
  Feed: 'waves', Mapa: 'map-pin', Especies: 'fish', Comunidade: 'users', Mensagens: 'mail', Perfil: 'user',
}

/** Abas de baixo, o jeito de navegar do celular (no site é o menu do topo). */
const AbasNavigator = () => {
  const { trocarSenhaPendente } = useAuth()
  return (
    <Abas.Navigator
      initialRouteName={trocarSenhaPendente ? 'Perfil' : 'Feed'}
      screenOptions={({ route }) => ({
        headerShown: false,
        animation: preferencias.menosMovimento ? 'none' : 'shift',
        tabBarActiveTintColor: cores.destaque,
        tabBarInactiveTintColor: cores.textoApagado,
        tabBarStyle: { backgroundColor: cores.fundo2, borderTopColor: cores.borda },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => <Icone nome={ICONES[route.name]} cor={color} tamanho={size - 2} />,
      })}
    >
      <Abas.Screen name="Feed" component={FeedScreen} />
      <Abas.Screen name="Mapa" component={MapaScreen} />
      <Abas.Screen name="Especies" component={EspeciesScreen} options={{ title: 'Espécies' }} />
      <Abas.Screen name="Comunidade" component={ComunidadeScreen} />
      <Abas.Screen name="Mensagens" component={ConversasScreen} />
      <Abas.Screen name="Perfil" component={PerfilScreen} />
    </Abas.Navigator>
  )
}

export default AbasNavigator
