import React, { useEffect } from 'react'
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import Avatar from '../components/Avatar'
import Icone from '../components/Icone'
import type { NomeIcone } from '../components/Icone'
import { Aviso, Carregando, EstadoVazio } from '../components/Estados'
import { useEu } from '../contexts/AuthContext'
import { usePresencaApp } from '../contexts/PresencaContext'
import { useCarregar } from '../hooks/useCarregar'
import { notificacoes } from '../services/api'
import { tempoAtras } from '../utils/formatar'
import { destinoDoAviso } from '../utils/destino'
import type { Notificacao } from '../types/api'
import type { RaizParams } from '../types/navegacao'
import { base, cores, espaco, raio } from '../theme/tema'

type Props = NativeStackScreenProps<RaizParams, 'Notificacoes'>

/** Textos iguais aos da página de notificações do site. */
const TIPOS: Record<string, { icone: NomeIcone; texto: string; cor: string }> = {
  like: { icone: 'heart', texto: 'curtiu seu post', cor: '#e11d48' },
  comment: { icone: 'message', texto: 'comentou no seu post', cor: '#0077b6' },
  follow: { icone: 'user', texto: 'começou a te seguir', cor: '#6d28d9' },
  message: { icone: 'mail', texto: 'te enviou uma mensagem', cor: '#0d9488' },
  comunidade: { icone: 'users', texto: 'respondeu seu pedido na Comunidade', cor: '#6d28d9' },
  'comunidade-pedido': { icone: 'users', texto: 'quer entrar na sua comunidade', cor: '#6d28d9' },
  'comunidade-aceito': { icone: 'check', texto: 'aceitou você na comunidade', cor: '#6d28d9' },
  'comunidade-admin': { icone: 'users', texto: 'tornou você admin da comunidade', cor: '#6d28d9' },
  'moderacao-oculto': { icone: 'flag', texto: 'ocultou seu post do feed por denúncias. Um administrador vai revisar.', cor: '#c2410c' },
  'moderacao-liberado': { icone: 'check', texto: 'revisou seu post, que voltou ao feed.', cor: '#0d9488' },
}

const ehDoSistema = (n: Notificacao) => n.type.startsWith('moderacao') || n.type === 'comunidade-admin'

const NotificacoesScreen = ({ navigation }: Props) => {
  const eu = useEu()
  const { zerarNaoLidas } = usePresencaApp()
  const lista = useCarregar<Notificacao[]>(() => notificacoes.listar(eu.username), [eu.username], 15_000)

  // abrir a tela marca tudo como lido (igual ao site)
  useEffect(() => {
    if (!lista.dados) return
    if (lista.dados.some(n => !n.is_read)) notificacoes.marcarLidas(eu.username).then(zerarNaoLidas).catch(() => undefined)
    else zerarNaoLidas()
  }, [lista.dados, eu.username, zerarNaoLidas])

  // curtida, comentário e moderação abrem o post; mensagem abre a conversa; seguidor abre o perfil
  const abrir = (n: Notificacao) => {
    const destino = destinoDoAviso(n.type, n.post_id, n.sender)
    if (destino) navigation.navigate(...destino)
    else if (n.type.startsWith('comunidade')) navigation.navigate('Abas', { screen: 'Comunidade' })
    else if (ehDoSistema(n)) navigation.navigate('Abas', { screen: 'Perfil' })
    else navigation.navigate('Usuario', { username: n.sender })
  }

  if (lista.carregando && !lista.dados) return <View style={base.tela}><Carregando /></View>

  return (
    <FlatList
      style={base.tela}
      data={lista.dados ?? []}
      keyExtractor={n => String(n.id)}
      contentContainerStyle={{ padding: espaco.lg, gap: espaco.sm }}
      ListHeaderComponent={<Aviso tipo="erro" texto={lista.erro} />}
      ListEmptyComponent={<EstadoVazio icone="bell" texto="Nenhuma notificação ainda." />}
      refreshControl={<RefreshControl refreshing={false} onRefresh={() => void lista.recarregar(true)} tintColor={cores.destaque} colors={[cores.destaque]} />}
      renderItem={({ item: n }) => {
        const t = TIPOS[n.type] ?? { icone: 'bell' as NomeIcone, texto: n.type, cor: '#6d28d9' }
        const quem = ehDoSistema(n) ? n.sender : `@${n.sender}`
        return (
          <Pressable onPress={() => abrir(n)} style={[estilos.item, !n.is_read && estilos.naoLida]}
            accessibilityRole="button" accessibilityLabel={`${n.is_read ? '' : 'Nova. '}${quem} ${t.texto}${n.message ? `: ${n.message}` : ''}`}>
            <View>
              {ehDoSistema(n)
                ? <View style={estilos.sistema}><Icone nome="waves" tamanho={22} cor={cores.destaque} /></View>
                : <Avatar username={n.sender} url={n.sender_avatar} tamanho={46} />}
              <View style={[estilos.tipo, { backgroundColor: t.cor }]}><Icone nome={t.icone} tamanho={11} cor="#fff" espessura={2.5} /></View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={estilos.texto}><Text style={estilos.quem}>{quem}</Text> {t.texto}</Text>
              {!!n.message && <Text style={estilos.trecho} numberOfLines={1}>“{n.message}”</Text>}
            </View>
            <Text style={base.textoSuave}>{tempoAtras(n.created_at)}</Text>
          </Pressable>
        )
      }}
    />
  )
}

const estilos = StyleSheet.create({
  item: {
    flexDirection: 'row', alignItems: 'center', gap: espaco.md, padding: espaco.md, borderRadius: raio.lg,
    backgroundColor: cores.painel, borderWidth: 1, borderColor: cores.borda,
  },
  naoLida: { backgroundColor: 'rgba(0,212,255,0.07)', borderLeftWidth: 3, borderLeftColor: cores.destaque },
  sistema: { width: 46, height: 46, borderRadius: 23, backgroundColor: cores.destaqueFundo, alignItems: 'center', justifyContent: 'center' },
  tipo: {
    position: 'absolute', right: -4, bottom: -2, width: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: cores.fundo,
  },
  texto: { color: cores.textoSuave, fontSize: 14, lineHeight: 20 },
  quem: { color: cores.destaque, fontWeight: '700' },
  trecho: { color: cores.textoApagado, fontSize: 13, marginTop: 2 },
})

export default NotificacoesScreen
