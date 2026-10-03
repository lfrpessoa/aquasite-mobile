import React, { useCallback, useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { Image } from 'expo-image'
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg'
import Icone from '../Icone'
import VisorStory from './VisorStory'
import NovoStory from './NovoStory'
import AcoesStory from './AcoesStory'
import { contas, storys as apiStorys } from '../../services/api'
import { grupoParaVisor, marcarVistoNaLista, primeiroNaoVisto } from '../../utils/storys'
import type { GrupoVisor } from '../../utils/storys'
import type { GrupoStorys } from '../../types/api'
import { cores, espaco } from '../../theme/tema'

interface Props {
  eu: string
  aoAbrirPerfil: (username: string) => void
  /** muda quando o feed é puxado para atualizar */
  atualizar?: number
}


/**
 * Fila de storys no topo do Feed, como no Instagram: "Seu story" (com o + para postar) e
 * quem você segue. Anel colorido = tem story que você ainda não viu.
 */
const FilaStorys = ({ eu, aoAbrirPerfil, atualizar = 0 }: Props) => {
  const [grupos, setGrupos] = useState<GrupoStorys[]>([])
  const [visor, setVisor] = useState<{ grupos: GrupoVisor[]; inicio: { grupo: number; item: number } } | null>(null)
  const [novo, setNovo] = useState(false)
  const [meuAvatar, setMeuAvatar] = useState<string | null>(null)

  const carregar = useCallback(() => { apiStorys.listar().then(setGrupos).catch(() => {}) }, [])
  useEffect(() => { carregar() }, [carregar, atualizar])
  useEffect(() => { contas.perfil(eu).then(p => setMeuAvatar(p.avatar ?? null)).catch(() => {}) }, [eu, atualizar])
  useFocusEffect(carregar)

  const meu = grupos.find(g => g.meu)
  const outros = grupos.filter(g => !g.meu)

  const abrir = (g: GrupoStorys) => {
    if (g.meu) setVisor({ grupos: [grupoParaVisor(g)], inicio: { grupo: 0, item: 0 } })
    else setVisor({ grupos: outros.map(grupoParaVisor), inicio: { grupo: outros.indexOf(g), item: primeiroNaoVisto(g) } })
  }

  return (
    <View style={estilos.caixa}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.fila}>
        <Pressable style={estilos.bolinha} onPress={() => (meu ? abrir(meu) : setNovo(true))} accessibilityRole="button"
          accessibilityLabel={meu ? 'Ver o seu story' : 'Publicar um story'}>
          <View style={[estilos.anel, { backgroundColor: cores.borda }]}>
            <Capa url={meuAvatar} nome={eu} />
            <Pressable style={estilos.mais} onPress={() => setNovo(true)} hitSlop={6} accessibilityRole="button" accessibilityLabel="Novo story">
              <Icone nome="plus" tamanho={13} cor="#002033" espessura={3} />
            </Pressable>
          </View>
          <Text style={estilos.nome} numberOfLines={1}>Seu story</Text>
        </Pressable>
        {outros.map(g => (
          <Pressable key={g.autor} style={estilos.bolinha} onPress={() => abrir(g)} accessibilityRole="button"
            accessibilityLabel={`Storys de @${g.autor}${g.naoVistos ? `, ${g.naoVistos} não vistos` : ''}`}>
            <View style={[estilos.anel, g.naoVistos === 0 && { backgroundColor: cores.borda }]}>
              {g.naoVistos > 0 && <AnelNovo />}
              <Capa url={g.avatar} nome={g.autor} />
            </View>
            <Text style={estilos.nome} numberOfLines={1}>{g.autor}</Text>
          </Pressable>
        ))}
        {outros.length === 0 && (
          <Text style={estilos.vazio}>Quando alguém que você segue postar um story, ele aparece aqui.</Text>
        )}
      </ScrollView>

      {visor && (
        <VisorStory
          grupos={visor.grupos}
          inicio={visor.inicio}
          aoFechar={() => setVisor(null)}
          aoVer={item => { void apiStorys.marcarVisto(item.id).catch(() => {}); setGrupos(gs => marcarVistoNaLista(gs, item.id)) }}
          acoes={(g, item, controle) => (
            <AcoesStory key={item.id} grupo={g} item={item} eu={eu} controle={controle} aoAbrirPerfil={aoAbrirPerfil}
              aoApagar={() => { setVisor(null); carregar() }} />
          )}
        />
      )}
      <NovoStory visivel={novo} aoFechar={() => setNovo(false)} aoPublicar={carregar} />
    </View>
  )
}

/** Anel colorido (story ainda não visto), igual ao do site. */
const AnelNovo = () => (
  <Svg width={66} height={66} style={StyleSheet.absoluteFill} accessible={false}>
    <Defs>
      <LinearGradient id="anel" x1="0" y1="1" x2="1" y2="0">
        <Stop offset="0" stopColor="#ff3d7f" />
        <Stop offset="0.35" stopColor="#ffb347" />
        <Stop offset="0.7" stopColor="#00d4ff" />
        <Stop offset="1" stopColor="#7b5cff" />
      </LinearGradient>
    </Defs>
    <Circle cx={33} cy={33} r={31.5} stroke="url(#anel)" strokeWidth={3} fill="none" />
  </Svg>
)

const Capa = ({ url, nome }: { url?: string | null; nome: string }) => (
  <View style={estilos.capa}>
    {url ? <Image source={{ uri: url }} style={StyleSheet.absoluteFill} contentFit="cover" cachePolicy="memory-disk" />
      : <Text style={estilos.inicial}>{(nome[0] ?? '?').toUpperCase()}</Text>}
  </View>
)

const estilos = StyleSheet.create({
  caixa: { marginBottom: espaco.sm },
  fila: { gap: 12, paddingVertical: 6, paddingHorizontal: 2, alignItems: 'flex-start' },
  bolinha: { width: 70, alignItems: 'center', gap: 5 },
  anel: { width: 66, height: 66, borderRadius: 33, padding: 3 },
  capa: { flex: 1, borderRadius: 30, borderWidth: 3, borderColor: cores.fundo, overflow: 'hidden', backgroundColor: '#0b4f6c', alignItems: 'center', justifyContent: 'center' },
  inicial: { color: '#fff', fontSize: 22, fontWeight: '700' },
  mais: { position: 'absolute', right: -1, bottom: -1, width: 22, height: 22, borderRadius: 11, backgroundColor: cores.destaque, borderWidth: 2, borderColor: cores.fundo, alignItems: 'center', justifyContent: 'center' },
  nome: { color: cores.texto, fontSize: 11, maxWidth: 70 },
  vazio: { color: cores.textoApagado, fontSize: 12, maxWidth: 220, alignSelf: 'center', marginLeft: espaco.sm },
})

export default FilaStorys
