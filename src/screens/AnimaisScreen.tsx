import React, { useMemo, useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import Chips from '../components/Chips'
import Folha from '../components/Folha'
import Icone from '../components/Icone'
import IconeAnimal from '../components/IconeAnimal'
import { EstadoVazio } from '../components/Estados'
import { ANIMAIS, GRUPOS } from '../data/animais'
import type { Animal } from '../data/animais'
import { base, cores, espaco, raio } from '../theme/tema'

/** Animais Marinhos: o catálogo de 35 espécies (conteúdo fixo), com busca, filtro por grupo e a curiosidade de cada uma. */
const AnimaisScreen = () => {
  const [grupo, setGrupo] = useState('')
  const [busca, setBusca] = useState('')
  const [aberto, setAberto] = useState<Animal | null>(null)

  const termo = busca.trim().toLowerCase()
  const lista = useMemo(
    () => ANIMAIS.filter(a => (!grupo || a.grupo === grupo) && (!termo || a.nome.toLowerCase().includes(termo))),
    [grupo, termo])

  return (
    <View style={base.tela}>
      <FlatList
        data={lista}
        keyExtractor={a => a.nome}
        numColumns={3}
        columnWrapperStyle={{ gap: espaco.sm }}
        contentContainerStyle={estilos.lista}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={(
          <View style={{ gap: espaco.md, marginBottom: espaco.sm }}>
            <View style={estilos.busca}>
              <Icone nome="search" tamanho={16} cor={cores.textoApagado} />
              <TextInput value={busca} onChangeText={setBusca} placeholder="Buscar animal pelo nome"
                placeholderTextColor={cores.textoApagado} style={estilos.buscaInput} accessibilityLabel="Buscar animal pelo nome" />
            </View>
            <Chips opcoes={[{ valor: '', label: 'Todos' }, ...GRUPOS.map(g => ({ valor: g, label: g }))]}
              valor={grupo} aoMudar={setGrupo} rotulo="Grupo" />
            <Text style={estilos.contagem}>{lista.length} {lista.length === 1 ? 'espécie' : 'espécies'} catalogada{lista.length === 1 ? '' : 's'}</Text>
          </View>
        )}
        ListEmptyComponent={<EstadoVazio icone="fish" texto="Nenhum animal com esse nome." />}
        renderItem={({ item }) => (
          <Pressable style={({ pressed }) => [estilos.cartao, pressed && { opacity: 0.75 }]} onPress={() => setAberto(item)}
            accessibilityRole="button" accessibilityLabel={`${item.nome}, ${item.grupo}. Toque para ver a curiosidade`}>
            <IconeAnimal nome={item.icone} tamanho={30} />
            <Text style={estilos.nome} numberOfLines={2}>{item.nome}</Text>
            <Text style={estilos.grupo}>{item.grupo}</Text>
          </Pressable>
        )}
      />

      <Folha visivel={aberto !== null} aoFechar={() => setAberto(null)} titulo={aberto?.nome ?? ''}>
        {aberto && (
          <View style={estilos.ficha}>
            <IconeAnimal nome={aberto.icone} tamanho={60} />
            <Text style={estilos.selo}>{aberto.grupo.toUpperCase()}</Text>
            <View style={estilos.linhaInfo}>
              <Icone nome="waves" tamanho={16} cor={cores.destaque} />
              <Text style={base.textoSuave}>Profundidade</Text>
              <Text style={estilos.valor}>{aberto.profundidade}</Text>
            </View>
            <Text style={estilos.curiosidade}>{aberto.curiosidade}</Text>
          </View>
        )}
      </Folha>
    </View>
  )
}

const estilos = StyleSheet.create({
  lista: { padding: espaco.lg, gap: espaco.sm, paddingBottom: espaco.xxl },
  busca: {
    flexDirection: 'row', alignItems: 'center', gap: espaco.sm, paddingHorizontal: espaco.md, borderRadius: raio.pilula,
    borderWidth: 1, borderColor: cores.bordaForte, backgroundColor: 'rgba(255,255,255,0.05)',
  },
  buscaInput: { flex: 1, color: cores.texto, minHeight: 44, fontSize: 15 },
  contagem: { color: cores.textoApagado, fontSize: 12, textAlign: 'center', letterSpacing: 0.5 },
  cartao: {
    flex: 1, maxWidth: '33.3%', alignItems: 'center', justifyContent: 'center', gap: 4, minHeight: 76,
    paddingVertical: espaco.md, paddingHorizontal: 6,
    backgroundColor: cores.painel, borderRadius: raio.md, borderWidth: 1, borderColor: cores.borda,
  },
  nome: { color: cores.texto, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  grupo: { color: cores.destaque, fontSize: 11 },
  ficha: { alignItems: 'center', gap: espaco.md },
  selo: {
    color: cores.destaque, fontSize: 12, fontWeight: '700', letterSpacing: 1, paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: raio.pilula, borderWidth: 1, borderColor: 'rgba(0,212,255,0.4)', overflow: 'hidden',
  },
  linhaInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' },
  valor: { color: cores.texto, fontWeight: '700' },
  curiosidade: { color: cores.texto, fontSize: 16, lineHeight: 24, textAlign: 'center' },
})

export default AnimaisScreen
