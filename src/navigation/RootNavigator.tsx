import React, { useEffect } from 'react'
import { DarkTheme, DefaultTheme, NavigationContainer, createNavigationContainerRef } from '@react-navigation/native'
import type { Theme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import AbasNavigator from './AbasNavigator'
import EntrarScreen from '../screens/EntrarScreen'
import UsuarioScreen from '../screens/UsuarioScreen'
import ChatScreen from '../screens/ChatScreen'
import PostScreen from '../screens/PostScreen'
import NotificacoesScreen from '../screens/NotificacoesScreen'
import BuscaScreen from '../screens/BuscaScreen'
import FeedComunidadeScreen from '../screens/FeedComunidadeScreen'
import AdminScreen from '../screens/AdminScreen'
import MapaScreen from '../screens/MapaScreen'
import CuriosidadesScreen from '../screens/CuriosidadesScreen'
import AnimaisScreen from '../screens/AnimaisScreen'
import SobreScreen from '../screens/SobreScreen'
import { Carregando } from '../components/Estados'
import { useAuth } from '../contexts/AuthContext'
import { aoTocarNoAviso, configurarPush, registrarAparelho } from '../services/push'
import type { RaizParams } from '../types/navegacao'
import { destinoDoAviso } from '../utils/destino'
import { cores } from '../theme/tema'
import { preferencias } from '../theme/cores'

const Pilha = createNativeStackNavigator<RaizParams>()
const navegacao = createNavigationContainerRef<RaizParams>()

const baseTema = preferencias.tema === 'claro' ? DefaultTheme : DarkTheme
const tema: Theme = {
  ...baseTema,
  colors: { ...baseTema.colors, primary: cores.destaque, background: cores.fundo, card: cores.fundo2, text: cores.texto, border: cores.borda },
}

/**
 * Sem login: tela de entrada + páginas abertas (Mapa, Curiosidades, Sobre), como no site.
 * Com login: as abas + telas empilhadas (perfil de outra pessoa, chat, notificações...).
 */
const RootNavigator = () => {
  const { carregando, sessao } = useAuth()
  const logado = sessao?.usuario.username ?? null

  // push: ao entrar, registra este aparelho na API; tocar num aviso abre o que ele fala (post, conversa ou perfil)
  useEffect(() => {
    if (!logado) return
    void configurarPush().then(registrarAparelho)
    return aoTocarNoAviso(dados => {
      if (!navegacao.isReady()) return
      const destino = destinoDoAviso(dados.tipo, dados.postId, dados.remetente)
      if (destino) navegacao.navigate(...destino)
      else navegacao.navigate('Notificacoes')
    })
  }, [logado])

  if (carregando) return <Carregando texto="Abrindo o AquaSite..." />

  return (
    <NavigationContainer ref={navegacao} theme={tema}>
      <Pilha.Navigator screenOptions={{
        headerStyle: { backgroundColor: cores.fundo2 }, headerTintColor: cores.destaque,
        headerTitleStyle: { color: cores.texto }, contentStyle: { backgroundColor: cores.fundo },
        headerBackButtonDisplayMode: 'minimal',
        animation: preferencias.menosMovimento ? 'none' : 'default',
      }}>
        {sessao ? (
          <>
            <Pilha.Screen name="Abas" component={AbasNavigator} options={{ headerShown: false }} />
            <Pilha.Screen name="Usuario" component={UsuarioScreen} options={{ title: 'Perfil' }} />
            <Pilha.Screen name="Chat" component={ChatScreen} options={{ title: 'Conversa' }} />
            <Pilha.Screen name="Post" component={PostScreen} options={{ title: 'Post' }} />
            <Pilha.Screen name="Notificacoes" component={NotificacoesScreen} options={{ title: 'Notificações' }} />
            <Pilha.Screen name="Busca" component={BuscaScreen} options={{ title: 'Pesquisar' }} />
            <Pilha.Screen name="FeedComunidade" component={FeedComunidadeScreen} options={{ title: 'Feed' }} />
            <Pilha.Screen name="Admin" component={AdminScreen} options={{ title: 'Painel de administração' }} />
          </>
        ) : (
          <>
            <Pilha.Screen name="Entrar" component={EntrarScreen} options={{ headerShown: false }} />
            <Pilha.Screen name="MapaVisitante" component={MapaScreen} options={{ title: 'Mapa' }} />
          </>
        )}
        <Pilha.Screen name="Curiosidades" component={CuriosidadesScreen} />
        <Pilha.Screen name="Animais" component={AnimaisScreen} options={{ title: 'Animais Marinhos' }} />
        <Pilha.Screen name="Sobre" component={SobreScreen} options={{ title: 'Sobre o AquaSite' }} />
      </Pilha.Navigator>
    </NavigationContainer>
  )
}

export default RootNavigator
