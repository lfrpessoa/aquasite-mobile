import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Avatar from '../Avatar'
import Icone from '../Icone'
import { tempoAtras } from '../../utils/formatar'
import type { GrupoVisor, ItemVisor } from '../../utils/storys'
import { preferencias } from '../../theme/cores'

const DURACAO_MS = 6000
const PASSO_MS = 50

export interface ControleVisor {
  pausar: () => void
  retomar: () => void
  fechar: () => void
}

interface Props {
  grupos: GrupoVisor[]
  inicio: { grupo: number; item: number }
  aoFechar: () => void
  /** chamado quando um story aparece na tela (para marcar como visto) */
  aoVer?: (item: ItemVisor) => void
  /** botões da parte de baixo (responder, quem viu, destaque, apagar...) */
  acoes?: (grupo: GrupoVisor, item: ItemVisor, controle: ControleVisor) => ReactNode
  /** botão "Abrir post" dos posts guardados em destaques */
  aoAbrirPost?: (id: number) => void
}

/**
 * Storys (e itens de um destaque) em tela cheia, um por vez, como no Instagram — igual ao visor do site.
 * Toque à direita avança, à esquerda volta; segurar o dedo pausa.
 */
const VisorStory = ({ grupos, inicio, aoFechar, aoVer, acoes, aoAbrirPost }: Props) => {
  const margens = useSafeAreaInsets()
  const [pos, setPos] = useState(inicio)
  const [progresso, setProgresso] = useState(0)
  const [pausas, setPausas] = useState(0)
  // chave do item cuja foto já carregou (o relógio só corre depois disso)
  const [carregadaChave, setCarregadaChave] = useState<string | null>(null)
  const decorrido = useRef(0)

  const grupo = grupos[pos.grupo]
  const item = grupo?.itens[pos.item]
  const chaveAtual = `${pos.grupo}-${pos.item}`
  const carregada = !item?.imagem || carregadaChave === chaveAtual

  // muda de item: zera o tempo e a barra
  const irPara = useCallback((p: { grupo: number; item: number }) => {
    decorrido.current = 0
    setProgresso(0)
    setPos(p)
  }, [])

  const avancar = useCallback(() => {
    const g = grupos[pos.grupo]
    if (pos.item + 1 < g.itens.length) irPara({ grupo: pos.grupo, item: pos.item + 1 })
    else if (pos.grupo + 1 < grupos.length) irPara({ grupo: pos.grupo + 1, item: 0 })
    else aoFechar()
  }, [grupos, pos, aoFechar, irPara])

  const voltar = useCallback(() => {
    if (pos.item > 0) irPara({ grupo: pos.grupo, item: pos.item - 1 })
    else if (pos.grupo > 0) irPara({ grupo: pos.grupo - 1, item: grupos[pos.grupo - 1].itens.length - 1 })
    else irPara(pos)
  }, [grupos, pos, irPara])

  // novo item na tela: avisa que foi visto
  useEffect(() => {
    if (item && item.tipo === 'story' && !item.visto && !grupo.meu) aoVer?.(item)
  }, [pos.grupo, pos.item]) // eslint-disable-line react-hooks/exhaustive-deps -- só quando muda o item

  // relógio do item (só corre com a foto carregada e sem pausa)
  useEffect(() => {
    if (!item || pausas > 0 || !carregada) return
    const id = setInterval(() => {
      decorrido.current += PASSO_MS
      const p = Math.min(1, decorrido.current / DURACAO_MS)
      setProgresso(p)
      if (p >= 1) { clearInterval(id); avancar() }
    }, PASSO_MS)
    return () => clearInterval(id)
  }, [item, pausas, carregada, avancar])

  if (!grupo || !item) return null
  const controle: ControleVisor = {
    pausar: () => setPausas(n => n + 1),
    retomar: () => setPausas(n => Math.max(0, n - 1)),
    fechar: aoFechar,
  }

  return (
    <Modal visible transparent={false} animationType={preferencias.menosMovimento ? 'none' : 'fade'} onRequestClose={aoFechar} statusBarTranslucent>
      <View style={[estilos.tela, { paddingTop: margens.top + 6, paddingBottom: margens.bottom + 8 }]} accessibilityViewIsModal>
        <View style={estilos.barras}>
          {grupo.itens.map((it, i) => (
            <View key={`${it.tipo}-${it.id}`} style={estilos.barra}>
              <View style={[estilos.barraCheia, { width: `${(i < pos.item ? 1 : i === pos.item ? progresso : 0) * 100}%` }]} />
            </View>
          ))}
        </View>

        <View style={estilos.cabecalho}>
          {grupo.icone && !grupo.avatar
            ? <View style={estilos.iconeDestaque}><Icone nome={grupo.icone} tamanho={18} cor="#3a2300" /></View>
            : <Avatar username={grupo.nome} url={grupo.avatar} tamanho={34} />}
          <Text style={estilos.titulo} numberOfLines={1}>{grupo.titulo}</Text>
          {!!item.created_at && <Text style={estilos.tempo}>{tempoAtras(item.created_at)}</Text>}
          {item.tipo === 'post' && <Text style={estilos.etiqueta}>post</Text>}
          <View style={{ flex: 1 }} />
          <Pressable onPress={() => setPausas(n => (n > 0 ? 0 : 1))} hitSlop={10} accessibilityRole="button"
            accessibilityLabel={pausas > 0 ? 'Continuar' : 'Pausar'}>
            <Text style={estilos.pausa}>{pausas > 0 ? '▶' : '❚❚'}</Text>
          </Pressable>
          <Pressable onPress={aoFechar} hitSlop={12} accessibilityRole="button" accessibilityLabel="Fechar">
            <Icone nome="x" tamanho={26} cor="#ffffff" />
          </Pressable>
        </View>

        <View style={estilos.midia}>
          {item.imagem ? (
            <Image source={{ uri: item.imagem }} style={StyleSheet.absoluteFill} contentFit="contain" cachePolicy="memory-disk"
              onLoad={() => setCarregadaChave(chaveAtual)} onError={() => setCarregadaChave(chaveAtual)}
              accessibilityLabel={item.texto ?? `Story de ${grupo.titulo}`} />
          ) : (
            <View style={estilos.soTexto}><Text style={estilos.soTextoTexto}>{item.texto}</Text></View>
          )}
          {!!item.imagem && !!item.texto && item.tipo === 'story' && (
            <View style={estilos.legendaSobre} pointerEvents="none"><Text style={estilos.legendaTexto}>{item.texto}</Text></View>
          )}
          {!carregada && <Text style={estilos.carregando}>Carregando…</Text>}
          <Pressable style={[estilos.zona, { left: 0, width: '32%' }]} onPress={voltar} onLongPress={() => {}} delayLongPress={220}
            onPressIn={controle.pausar} onPressOut={controle.retomar} accessibilityRole="button" accessibilityLabel="Anterior" />
          <Pressable style={[estilos.zona, { right: 0, width: '68%' }]} onPress={avancar} onLongPress={() => {}} delayLongPress={220}
            onPressIn={controle.pausar} onPressOut={controle.retomar} accessibilityRole="button" accessibilityLabel="Próximo" />
        </View>

        {item.tipo === 'post' && (
          <View style={estilos.legendaPost}>
            {!!item.imagem && !!item.texto && <Text style={estilos.legendaPostTexto} numberOfLines={3}>{item.texto}</Text>}
            {aoAbrirPost && (
              <Pressable onPress={() => { aoFechar(); aoAbrirPost(item.id) }} accessibilityRole="link" style={estilos.abrirPost}>
                <Icone nome="link" tamanho={15} cor="#00d4ff" /><Text style={estilos.abrirPostTexto}>Abrir post</Text>
              </Pressable>
            )}
          </View>
        )}
        {acoes && <View style={estilos.acoes}>{acoes(grupo, item, controle)}</View>}
      </View>
    </Modal>
  )
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#000' },
  barras: { flexDirection: 'row', gap: 4, paddingHorizontal: 10 },
  barra: { flex: 1, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.35)', overflow: 'hidden' },
  barraCheia: { height: '100%', backgroundColor: '#fff' },
  cabecalho: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10 },
  iconeDestaque: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#f9c74f', alignItems: 'center', justifyContent: 'center' },
  titulo: { color: '#fff', fontWeight: '700', fontSize: 15, maxWidth: '45%' },
  tempo: { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  etiqueta: { color: '#fff', fontSize: 11, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)', borderRadius: 999, paddingHorizontal: 7 },
  pausa: { color: '#fff', fontSize: 14, paddingHorizontal: 8 },
  midia: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  soTexto: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#0077b6', alignItems: 'center', justifyContent: 'center', padding: 28 },
  soTextoTexto: { color: '#fff', fontSize: 22, fontWeight: '700', textAlign: 'center', lineHeight: 30 },
  legendaSobre: { position: 'absolute', top: '20%', alignSelf: 'center', maxWidth: '86%', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  legendaTexto: { color: '#fff', fontWeight: '700', fontSize: 16, textAlign: 'center' },
  carregando: { color: 'rgba(255,255,255,0.7)' },
  zona: { position: 'absolute', top: 0, bottom: 0 },
  legendaPost: { paddingHorizontal: 16, paddingTop: 10, gap: 6 },
  legendaPostTexto: { color: '#fff', fontSize: 14, lineHeight: 20 },
  abrirPost: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 4 },
  abrirPostTexto: { color: '#00d4ff', fontWeight: '700' },
  acoes: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingTop: 10, minHeight: 56 },
})

export default VisorStory
