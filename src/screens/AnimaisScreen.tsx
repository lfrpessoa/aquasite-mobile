import React, { useMemo, useState } from 'react'
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import Chips from '../components/Chips'
import Folha from '../components/Folha'
import Icone from '../components/Icone'
import { EstadoVazio } from '../components/Estados'
import { useCarregar } from '../hooks/useCarregar'
import { especies as apiEspecies } from '../services/api'
import { ANIMAIS, GRUPOS } from '../data/animais'
import type { Animal } from '../data/animais'
import type { Especie } from '../types/api'
import { base, cores, espaco, raio } from '../theme/tema'

type Aberto = { tipo: 'catalogo'; animal: Animal } | { tipo: 'banco'; especie: Especie }

const EMOJI_POR_CATEGORIA: Record<string, string> = {
  peixe: '🐟', mamífero: '🐬', mamifero: '🐬', réptil: '🐢', reptil: '🐢', molusco: '🐙',
  crustáceo: '🦀', crustaceo: '🦀', cnidário: '🪼', cnidario: '🪼', equinodermo: '⭐', ave: '🐧',
}
const emojiDa = (e: Especie): string => EMOJI_POR_CATEGORIA[(e.categoria ?? '').trim().toLowerCase()] ?? '🌊'
const temImagem = (e: Especie): boolean => !!e.imagem && /^(https?:|data:image\/)/.test(e.imagem)

/**
 * Animais Marinhos: o catálogo de 35 espécies (conteúdo fixo) e, no topo, as espécies que os
 * administradores cadastram no painel admin (GET /api/especies — o mesmo banco do site).
 */
const AnimaisScreen = () => {
  const [grupo, setGrupo] = useState('')
  const [busca, setBusca] = useState('')
  const [aberto, setAberto] = useState<Aberto | null>(null)
  const doBanco = useCarregar<Especie[]>(apiEspecies.listar, [])

  const termo = busca.trim().toLowerCase()
  const lista = useMemo(
    () => ANIMAIS.filter(a => (!grupo || a.grupo === grupo) && (!termo || a.nome.toLowerCase().includes(termo))),
    [grupo, termo])
  const cadastradas = (doBanco.dados ?? []).filter(e => !termo || e.nome.toLowerCase().includes(termo)
    || (e.nomeCientifico ?? '').toLowerCase().includes(termo))

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

            {cadastradas.length > 0 && (
              <View style={{ gap: espaco.sm }}>
                <Text style={base.tituloSecao}>Cadastradas pelos administradores</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: espaco.sm }}>
                  {cadastradas.map(e => (
                    <Pressable key={e.id} style={({ pressed }) => [estilos.cartaoBanco, pressed && { opacity: 0.75 }]}
                      onPress={() => setAberto({ tipo: 'banco', especie: e })}
                      accessibilityRole="button" accessibilityLabel={`${e.nome}${e.categoria ? `, ${e.categoria}` : ''}. Toque para ver a ficha`}>
                      {temImagem(e)
                        ? <Image source={{ uri: e.imagem ?? '' }} style={estilos.fotoBanco} accessibilityIgnoresInvertColors />
                        : <Text style={estilos.emoji} accessible={false}>{emojiDa(e)}</Text>}
                      <Text style={estilos.nome} numberOfLines={2}>{e.nome}</Text>
                      {!!e.categoria && <Text style={estilos.grupo}>{e.categoria}</Text>}
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            <Text style={base.tituloSecao}>Catálogo</Text>
            <Chips opcoes={[{ valor: '', label: 'Todos' }, ...GRUPOS.map(g => ({ valor: g, label: g }))]}
              valor={grupo} aoMudar={setGrupo} rotulo="Grupo" />
            <Text style={estilos.contagem}>{lista.length} {lista.length === 1 ? 'espécie' : 'espécies'} catalogada{lista.length === 1 ? '' : 's'}</Text>
          </View>
        )}
        ListEmptyComponent={<EstadoVazio icone="fish" texto="Nenhum animal com esse nome." />}
        renderItem={({ item }) => (
          <Pressable style={({ pressed }) => [estilos.cartao, pressed && { opacity: 0.75 }]} onPress={() => setAberto({ tipo: 'catalogo', animal: item })}
            accessibilityRole="button" accessibilityLabel={`${item.nome}, ${item.grupo}. Toque para ver a curiosidade`}>
            <Text style={estilos.emoji} accessible={false}>{item.emoji}</Text>
            <Text style={estilos.nome} numberOfLines={2}>{item.nome}</Text>
            <Text style={estilos.grupo}>{item.grupo}</Text>
          </Pressable>
        )}
      />

      <Folha visivel={aberto !== null} aoFechar={() => setAberto(null)}
        titulo={aberto?.tipo === 'catalogo' ? aberto.animal.nome : aberto?.especie.nome ?? ''}>
        {aberto?.tipo === 'catalogo' && (
          <View style={estilos.ficha}>
            <Text style={estilos.emojiGrande} accessible={false}>{aberto.animal.emoji}</Text>
            <Text style={estilos.selo}>{aberto.animal.grupo.toUpperCase()}</Text>
            <View style={estilos.linhaInfo}>
              <Icone nome="waves" tamanho={16} cor={cores.destaque} />
              <Text style={base.textoSuave}>Profundidade</Text>
              <Text style={estilos.valor}>{aberto.animal.profundidade}</Text>
            </View>
            <Text style={estilos.curiosidade}>{aberto.animal.curiosidade}</Text>
          </View>
        )}
        {aberto?.tipo === 'banco' && (
          <View style={estilos.ficha}>
            {temImagem(aberto.especie)
              ? <Image source={{ uri: aberto.especie.imagem ?? '' }} style={estilos.fotoGrande} accessibilityLabel={`Foto de ${aberto.especie.nome}`} />
              : <Text style={estilos.emojiGrande} accessible={false}>{emojiDa(aberto.especie)}</Text>}
            {!!aberto.especie.nomeCientifico && <Text style={estilos.cientifico}>{aberto.especie.nomeCientifico}</Text>}
            {!!aberto.especie.categoria && <Text style={estilos.selo}>{aberto.especie.categoria.toUpperCase()}</Text>}
            {!!aberto.especie.habitat && (
              <View style={estilos.linhaInfo}>
                <Icone nome="map-pin" tamanho={16} cor={cores.destaque} />
                <Text style={base.textoSuave}>Habitat</Text>
                <Text style={estilos.valor}>{aberto.especie.habitat}</Text>
              </View>
            )}
            {!!aberto.especie.descricao && <Text style={estilos.curiosidade}>{aberto.especie.descricao}</Text>}
            <Text style={estilos.origem}>Cadastrada pelos administradores do AquaSite</Text>
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
    flex: 1, maxWidth: '33.3%', alignItems: 'center', gap: 4, paddingVertical: espaco.md, paddingHorizontal: 6,
    backgroundColor: cores.painel, borderRadius: raio.md, borderWidth: 1, borderColor: cores.borda,
  },
  cartaoBanco: {
    width: 116, alignItems: 'center', gap: 4, paddingVertical: espaco.md, paddingHorizontal: 6,
    backgroundColor: cores.destaqueFundo, borderRadius: raio.md, borderWidth: 1, borderColor: 'rgba(0,212,255,0.35)',
  },
  fotoBanco: { width: 44, height: 44, borderRadius: 22 },
  emoji: { fontSize: 34 },
  nome: { color: cores.texto, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  grupo: { color: cores.destaque, fontSize: 11 },
  ficha: { alignItems: 'center', gap: espaco.md },
  emojiGrande: { fontSize: 64 },
  fotoGrande: { width: '100%', height: 200, borderRadius: raio.md },
  cientifico: { color: cores.textoSuave, fontStyle: 'italic', fontSize: 15 },
  selo: {
    color: cores.destaque, fontSize: 12, fontWeight: '700', letterSpacing: 1, paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: raio.pilula, borderWidth: 1, borderColor: 'rgba(0,212,255,0.4)', overflow: 'hidden',
  },
  linhaInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' },
  valor: { color: cores.texto, fontWeight: '700' },
  curiosidade: { color: cores.texto, fontSize: 16, lineHeight: 24, textAlign: 'center' },
  origem: { color: cores.textoApagado, fontSize: 12 },
})

export default AnimaisScreen
