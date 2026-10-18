import React, { useContext, useEffect, useMemo, useState } from 'react'
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native'
import { Image } from 'expo-image'
import { NavigationContext } from '@react-navigation/native'
import Chips from '../components/Chips'
import Folha from '../components/Folha'
import Icone from '../components/Icone'
import IconeAnimal from '../components/IconeAnimal'
import type { IconeAnimalNome } from '../components/IconeAnimal'
import { Aviso, Carregando, EstadoVazio } from '../components/Estados'
import { useCarregar } from '../hooks/useCarregar'
import { especies } from '../services/api'
import { ANIMAIS, iconeDaEspecie } from '../data/animais'
import type { Especie } from '../types/api'
import { base, cores, espaco, raio } from '../theme/tema'

/** Um cartão do catálogo: vem de uma espécie do banco ou, sem conexão, da lista fixa de reserva. */
interface ItemCatalogo {
  chave: string
  nome: string
  nomeCientifico?: string | null
  grupo: string
  icone: IconeAnimalNome
  imagem?: string | null
  habitat?: string | null
  profundidade?: string
  texto: string | null
}

const daEspecie = (e: Especie): ItemCatalogo => ({
  chave: `api-${e.id}`, nome: e.nome, nomeCientifico: e.nomeCientifico, grupo: e.categoria?.trim() || 'Outros',
  icone: iconeDaEspecie(e.nome, e.categoria), imagem: e.imagem?.trim() || null, habitat: e.habitat, texto: e.descricao,
})

const RESERVA: ItemCatalogo[] = ANIMAIS.map(a => ({
  chave: `fixo-${a.nome}`, nome: a.nome, grupo: a.grupo, icone: a.icone, profundidade: a.profundidade, texto: a.curiosidade,
}))

/**
 * Animais Marinhos: o catálogo vem das espécies cadastradas no painel do admin (GET /api/especies),
 * com busca, filtro por grupo e a ficha de cada uma. Se a API não responder, mostra a lista fixa de reserva.
 */
const AnimaisScreen = () => {
  const [grupo, setGrupo] = useState('')
  const [busca, setBusca] = useState('')
  const [aberto, setAberto] = useState<ItemCatalogo | null>(null)
  const dados = useCarregar<Especie[]>(especies.listar, [])
  const { recarregar } = dados

  // a tela fica montada na aba: ao voltar para ela, busca de novo (o admin pode ter cadastrado ou editado espécies)
  const navegacao = useContext(NavigationContext)
  useEffect(() => navegacao?.addListener('focus', () => { void recarregar(true) }), [navegacao, recarregar])

  const offline = !dados.dados && !!dados.erro
  const catalogo = useMemo(
    () => (dados.dados ? dados.dados.map(daEspecie).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')) : offline ? RESERVA : []),
    [dados.dados, offline])
  const grupos = useMemo(() => [...new Set(catalogo.map(a => a.grupo))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [catalogo])

  const termo = busca.trim().toLowerCase()
  const lista = useMemo(
    () => catalogo.filter(a => (!grupo || a.grupo === grupo)
      && (!termo || a.nome.toLowerCase().includes(termo) || !!a.nomeCientifico?.toLowerCase().includes(termo))),
    [catalogo, grupo, termo])

  if (dados.carregando && !dados.dados && !dados.erro) return <View style={base.tela}><Carregando texto="Carregando espécies..." /></View>

  return (
    <View style={base.tela}>
      <FlatList
        data={lista}
        keyExtractor={a => a.chave}
        numColumns={3}
        columnWrapperStyle={{ gap: espaco.sm }}
        contentContainerStyle={estilos.lista}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={false} onRefresh={() => void recarregar()} tintColor={cores.destaque} colors={[cores.destaque]} />}
        ListHeaderComponent={(
          <View style={{ gap: espaco.md, marginBottom: espaco.sm }}>
            {offline && <Aviso tipo="atencao" texto="Sem conexão com o servidor: mostrando o catálogo salvo no app. Puxe para atualizar." />}
            <View style={estilos.busca}>
              <Icone nome="search" tamanho={16} cor={cores.textoApagado} />
              <TextInput value={busca} onChangeText={setBusca} placeholder="Buscar animal pelo nome"
                placeholderTextColor={cores.textoApagado} style={estilos.buscaInput} accessibilityLabel="Buscar animal pelo nome" />
            </View>
            {grupos.length > 1 && (
              <Chips opcoes={[{ valor: '', label: 'Todos' }, ...grupos.map(g => ({ valor: g, label: g }))]}
                valor={grupo} aoMudar={setGrupo} rotulo="Grupo" />
            )}
            <Text style={estilos.contagem}>{lista.length} {lista.length === 1 ? 'espécie' : 'espécies'} catalogada{lista.length === 1 ? '' : 's'}</Text>
          </View>
        )}
        ListEmptyComponent={catalogo.length
          ? <EstadoVazio icone="fish" texto="Nenhum animal com esse nome." />
          : <EstadoVazio icone="fish" texto="Nenhuma espécie cadastrada ainda." />}
        renderItem={({ item }) => (
          <Pressable style={({ pressed }) => [estilos.cartao, pressed && { opacity: 0.75 }]} onPress={() => setAberto(item)}
            accessibilityRole="button" accessibilityLabel={`${item.nome}, ${item.grupo}. Toque para ver a ficha`}>
            {item.imagem
              ? <Image source={{ uri: item.imagem }} style={estilos.miniatura} contentFit="cover" cachePolicy="memory-disk" accessibilityIgnoresInvertColors />
              : <IconeAnimal nome={item.icone} tamanho={30} />}
            <Text style={estilos.nome} numberOfLines={2}>{item.nome}</Text>
            <Text style={estilos.grupo}>{item.grupo}</Text>
          </Pressable>
        )}
      />

      <Folha visivel={aberto !== null} aoFechar={() => setAberto(null)} titulo={aberto?.nome ?? ''}>
        {aberto && (
          <View style={estilos.ficha}>
            {aberto.imagem
              ? <Image source={{ uri: aberto.imagem }} style={estilos.foto} contentFit="cover" cachePolicy="memory-disk" accessibilityLabel={aberto.nome} />
              : <IconeAnimal nome={aberto.icone} tamanho={60} />}
            <Text style={estilos.selo}>{aberto.grupo.toUpperCase()}</Text>
            {!!aberto.nomeCientifico && <Text style={estilos.cientifico}>{aberto.nomeCientifico}</Text>}
            {!!aberto.habitat && (
              <View style={estilos.linhaInfo}>
                <Icone nome="map-pin" tamanho={16} cor={cores.destaque} />
                <Text style={base.textoSuave}>Habitat</Text>
                <Text style={estilos.valor}>{aberto.habitat}</Text>
              </View>
            )}
            {!!aberto.profundidade && (
              <View style={estilos.linhaInfo}>
                <Icone nome="waves" tamanho={16} cor={cores.destaque} />
                <Text style={base.textoSuave}>Profundidade</Text>
                <Text style={estilos.valor}>{aberto.profundidade}</Text>
              </View>
            )}
            {!!aberto.texto && <Text style={estilos.curiosidade}>{aberto.texto}</Text>}
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
  miniatura: { width: 36, height: 36, borderRadius: 18 },
  foto: { width: '100%', aspectRatio: 16 / 10, borderRadius: raio.md },
  nome: { color: cores.texto, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  grupo: { color: cores.destaque, fontSize: 11 },
  ficha: { alignItems: 'center', gap: espaco.md },
  selo: {
    color: cores.destaque, fontSize: 12, fontWeight: '700', letterSpacing: 1, paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: raio.pilula, borderWidth: 1, borderColor: 'rgba(0,212,255,0.4)', overflow: 'hidden',
  },
  cientifico: { color: cores.textoApagado, fontSize: 14, fontStyle: 'italic' },
  linhaInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' },
  valor: { color: cores.texto, fontWeight: '700' },
  curiosidade: { color: cores.texto, fontSize: 16, lineHeight: 24, textAlign: 'center' },
})

export default AnimaisScreen
