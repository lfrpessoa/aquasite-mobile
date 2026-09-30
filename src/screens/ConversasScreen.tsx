import React from 'react'
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import type { CompositeScreenProps } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import Avatar from '../components/Avatar'
import Botao from '../components/Botao'
import { Aviso, Carregando, EstadoVazio } from '../components/Estados'
import { useEu } from '../contexts/AuthContext'
import { useCarregar } from '../hooks/useCarregar'
import { mensagens } from '../services/api'
import { tempoAtras } from '../utils/formatar'
import type { Conversa } from '../types/api'
import type { AbasParams, RaizParams } from '../types/navegacao'
import { base, cores, espaco } from '../theme/tema'

type Props = CompositeScreenProps<BottomTabScreenProps<AbasParams, 'Mensagens'>, NativeStackScreenProps<RaizParams>>

/** Conversas diretas (as mesmas do site), atualizadas a cada 10 s. */
const ConversasScreen = ({ navigation }: Props) => {
  const eu = useEu()
  const lista = useCarregar<Conversa[]>(() => mensagens.conversas(eu.username), [eu.username], 10_000)

  return (
    <SafeAreaView style={base.tela} edges={['top']}>
      <View style={estilos.topo}>
        <Text style={estilos.titulo} accessibilityRole="header">Mensagens</Text>
        <Botao titulo="Nova" icone="search" pequeno variante="secundario" onPress={() => navigation.navigate('Busca')}
          rotuloAcessivel="Nova conversa: pesquisar pessoa" />
      </View>
      {lista.carregando && !lista.dados ? <Carregando /> : (
        <FlatList
          data={lista.dados ?? []}
          keyExtractor={c => c.other_user}
          ListHeaderComponent={<Aviso tipo="erro" texto={lista.erro} />}
          ListEmptyComponent={<EstadoVazio icone="mail" texto="Nenhuma conversa ainda. Abra o perfil de alguém e toque em Mensagem." />}
          refreshControl={<RefreshControl refreshing={false} onRefresh={() => void lista.recarregar(true)} tintColor={cores.destaque} colors={[cores.destaque]} />}
          renderItem={({ item }) => (
            <Pressable style={({ pressed }) => [estilos.item, pressed && { opacity: 0.7 }]}
              onPress={() => navigation.navigate('Chat', { username: item.other_user })}
              accessibilityRole="button" accessibilityLabel={`Conversa com @${item.other_user}. Última: ${item.last_message ?? ''}`}>
              <Avatar username={item.other_user} url={item.avatar} online={item.online} tamanho={50} />
              <View style={{ flex: 1 }}>
                <View style={estilos.linha}>
                  <Text style={estilos.nome}>@{item.other_user}</Text>
                  <Text style={base.textoSuave}>{tempoAtras(item.last_time)}</Text>
                </View>
                <Text style={estilos.ultima} numberOfLines={1}>{item.last_message || 'Imagem'}</Text>
              </View>
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View style={estilos.separador} />}
        />
      )}
    </SafeAreaView>
  )
}

const estilos = StyleSheet.create({
  topo: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: espaco.lg,
    paddingVertical: espaco.md, borderBottomWidth: 1, borderBottomColor: cores.borda,
  },
  titulo: { color: cores.texto, fontSize: 22, fontWeight: '800' },
  item: { flexDirection: 'row', alignItems: 'center', gap: espaco.md, paddingHorizontal: espaco.lg, paddingVertical: espaco.md },
  linha: { flexDirection: 'row', justifyContent: 'space-between' },
  nome: { color: cores.texto, fontWeight: '700', fontSize: 15 },
  ultima: { color: cores.textoApagado, fontSize: 14, marginTop: 2 },
  separador: { height: 1, backgroundColor: cores.borda, marginLeft: 82 },
})

export default ConversasScreen
