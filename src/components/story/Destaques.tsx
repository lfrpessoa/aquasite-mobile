import React, { useCallback, useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'
import Icone from '../Icone'
import VisorStory from './VisorStory'
import EditarDestaque from './EditarDestaque'
import { destaques as apiDestaques } from '../../services/api'
import { destaqueParaVisor, iconeDoDestaque } from '../../utils/storys'
import type { Destaque, Post } from '../../types/api'
import { cores } from '../../theme/tema'

interface Props {
  username: string
  dono: boolean
  posts?: Post[]
  /** muda quando a tela quer recarregar (depois de guardar algo num destaque) */
  atualizar?: number
  aoAbrirPost: (id: number) => void
}

/** Bolinhas de destaques do perfil (iguais às do site). Tocar abre os itens em tela cheia. */
const Destaques = ({ username, dono, posts = [], atualizar = 0, aoAbrirPost }: Props) => {
  const [lista, setLista] = useState<Destaque[]>([])
  const [aberto, setAberto] = useState<number | null>(null)
  const [editando, setEditando] = useState<Destaque | null | undefined>(undefined) // undefined = fechado; null = novo

  const carregar = useCallback(() => { apiDestaques.doPerfil(username).then(setLista).catch(() => {}) }, [username])
  useEffect(() => { carregar() }, [carregar, atualizar])

  const comItens = lista.filter(d => d.itens.length > 0)
  if (!dono && comItens.length === 0) return null
  const grupos = comItens.map(d => destaqueParaVisor(d, dono))

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.fila}>
        {lista.map(d => (
          <Pressable key={d.id} style={estilos.bolinha} accessibilityRole="button"
            accessibilityLabel={d.itens.length ? `Destaque ${d.nome}` : `Destaque ${d.nome}, vazio: toque para editar`}
            onPress={() => (d.itens.length ? setAberto(comItens.indexOf(d)) : setEditando(d))}>
            <View style={estilos.anel}>
              <View style={[estilos.capa, !d.capa && estilos.capaIcone]}>
                {d.capa ? <Image source={{ uri: d.capa }} style={StyleSheet.absoluteFill} contentFit="cover" cachePolicy="memory-disk" />
                  : <Icone nome={iconeDoDestaque(d.icone)} tamanho={26} cor="#3a2300" />}
              </View>
            </View>
            <Text style={estilos.nome} numberOfLines={1}>{d.nome}</Text>
          </Pressable>
        ))}
        {dono && (
          <Pressable style={estilos.bolinha} onPress={() => setEditando(null)} accessibilityRole="button" accessibilityLabel="Criar um destaque">
            <View style={[estilos.anel, { backgroundColor: cores.borda }]}>
              <View style={[estilos.capa, { backgroundColor: cores.painel }]}><Icone nome="plus" tamanho={26} cor={cores.textoSuave} /></View>
            </View>
            <Text style={estilos.nome}>Novo</Text>
          </Pressable>
        )}
      </ScrollView>

      {aberto !== null && (
        <VisorStory
          grupos={grupos}
          inicio={{ grupo: aberto, item: 0 }}
          aoFechar={() => setAberto(null)}
          aoAbrirPost={aoAbrirPost}
          acoes={dono ? (g, _item, controle) => (
            <Pressable style={estilos.editar} accessibilityRole="button" accessibilityLabel="Editar destaque"
              onPress={() => { controle.fechar(); setEditando(lista.find(d => String(d.id) === g.chave) ?? null) }}>
              <Icone nome="pencil" tamanho={20} cor="#ffffff" /><Text style={estilos.editarTexto}>Editar destaque</Text>
            </Pressable>
          ) : undefined}
        />
      )}
      {dono && editando !== undefined && (
        <EditarDestaque visivel destaque={editando ?? null} posts={posts}
          aoFechar={() => setEditando(undefined)} aoSalvar={carregar} />
      )}
    </View>
  )
}

const estilos = StyleSheet.create({
  fila: { gap: 12, paddingVertical: 4, paddingHorizontal: 2 },
  bolinha: { width: 70, alignItems: 'center', gap: 5 },
  anel: { width: 66, height: 66, borderRadius: 33, padding: 3, backgroundColor: '#00b4d8' },
  capa: { flex: 1, borderRadius: 30, borderWidth: 3, borderColor: cores.fundo, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b4f6c' },
  capaIcone: { backgroundColor: '#f9c74f' },
  nome: { color: cores.texto, fontSize: 11, maxWidth: 70 },
  editar: { alignItems: 'center', gap: 3 },
  editarTexto: { color: '#fff', fontSize: 11 },
})

export default Destaques
