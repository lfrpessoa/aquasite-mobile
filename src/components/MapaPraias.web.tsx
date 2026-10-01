import React, { useState } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import type { GestureResponderEvent, LayoutChangeEvent } from 'react-native'
import Icone from './Icone'
import type { PropsMapa } from './MapaPraias'
import { cores } from '../theme/tema'

/**
 * Versão de navegador do mapa (usada na apresentação com o app aberto no computador).
 * O react-native-maps só existe no celular; aqui o mapa é montado com os "ladrilhos" de imagem
 * do OpenStreetMap (os mesmos do site), usando apenas View, Image e Pressable.
 * Toque numa praia ou em qualquer ponto; os botões + e − mudam o zoom.
 */
const TAMANHO = 256
const ZOOM_BRASIL = 4
const ZOOM_PRAIA = 12

/** Coordenada → pixel no mundo (projeção de Mercator, a mesma dos mapas da web). */
function paraPixel(lat: number, lon: number, zoom: number): { x: number; y: number } {
  const mundo = TAMANHO * 2 ** zoom
  const seno = Math.sin((lat * Math.PI) / 180)
  return {
    x: ((lon + 180) / 360) * mundo,
    y: (0.5 - Math.log((1 + seno) / (1 - seno)) / (4 * Math.PI)) * mundo,
  }
}

function paraCoordenada(x: number, y: number, zoom: number): { lat: number; lon: number } {
  const mundo = TAMANHO * 2 ** zoom
  const n = Math.PI - (2 * Math.PI * y) / mundo
  return { lon: (x / mundo) * 360 - 180, lat: (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))) }
}

const MapaPraias = ({ praias, selecionada, eu, aoTocarPraia, aoTocarPonto }: PropsMapa) => {
  const [tamanho, setTamanho] = useState({ largura: 0, altura: 0 })
  const [centro, setCentro] = useState({ lat: -15.5, lon: -47 })
  const [zoom, setZoom] = useState(ZOOM_BRASIL)

  // escolheu uma praia (na lista, na busca ou tocando no mapa): centraliza nela.
  // Ajuste feito durante a renderização (padrão do React), comparando com a seleção anterior.
  const [selecionadaAntes, setSelecionadaAntes] = useState(selecionada)
  if (selecionada !== selecionadaAntes) {
    setSelecionadaAntes(selecionada)
    if (selecionada) {
      setCentro({ lat: selecionada.lat, lon: selecionada.lon })
      setZoom(z => Math.max(z, ZOOM_PRAIA))
    }
  }

  const medir = (e: LayoutChangeEvent) =>
    setTamanho({ largura: e.nativeEvent.layout.width, altura: e.nativeEvent.layout.height })

  const c = paraPixel(centro.lat, centro.lon, zoom)
  const esquerda = c.x - tamanho.largura / 2
  const topo = c.y - tamanho.altura / 2
  const n = 2 ** zoom

  const ladrilhos: { chave: string; url: string; x: number; y: number }[] = []
  if (tamanho.largura > 0) {
    for (let tx = Math.floor(esquerda / TAMANHO); tx <= Math.floor((esquerda + tamanho.largura) / TAMANHO); tx++) {
      for (let ty = Math.floor(topo / TAMANHO); ty <= Math.floor((topo + tamanho.altura) / TAMANHO); ty++) {
        if (ty < 0 || ty >= n) continue
        const xReal = ((tx % n) + n) % n
        ladrilhos.push({
          chave: `${zoom}-${tx}-${ty}`,
          url: `https://tile.openstreetmap.org/${zoom}/${xReal}/${ty}.png`,
          // posição arredondada: sem isso aparecem linhas finas entre as imagens
          x: Math.round(tx * TAMANHO - esquerda),
          y: Math.round(ty * TAMANHO - topo),
        })
      }
    }
  }

  const naTela = (lat: number, lon: number) => {
    const p = paraPixel(lat, lon, zoom)
    return { left: p.x - esquerda, top: p.y - topo }
  }

  const tocar = (e: GestureResponderEvent) => {
    // no navegador o React Native não informa locationX/Y do clique: calcula pela posição do mapa na página
    let { locationX: x, locationY: y } = e.nativeEvent
    if (x == null || y == null || Number.isNaN(x) || Number.isNaN(y)) {
      const alvo = e.currentTarget as unknown as { getBoundingClientRect?: () => { left: number; top: number } }
      const caixa = alvo.getBoundingClientRect?.()
      if (!caixa) return
      x = e.nativeEvent.pageX - caixa.left
      y = e.nativeEvent.pageY - caixa.top
    }
    const { lat, lon } = paraCoordenada(esquerda + x, topo + y, zoom)
    if (!Number.isNaN(lat) && !Number.isNaN(lon)) aoTocarPonto(lat, lon)
  }

  const mudarZoom = (delta: number) => setZoom(z => Math.min(16, Math.max(3, z + delta)))

  return (
    <View style={StyleSheet.absoluteFill} onLayout={medir}>
      <Pressable style={StyleSheet.absoluteFill} onPress={tocar}
        accessibilityLabel="Mapa do litoral brasileiro. Toque numa praia ou em qualquer ponto">
        {ladrilhos.map(l => (
          <Image key={l.chave} source={{ uri: l.url }} style={[estilos.ladrilho, { left: l.x, top: l.y }]} accessible={false} />
        ))}
      </Pressable>

      {eu && <View pointerEvents="none" style={[estilos.eu, naTela(eu.lat, eu.lon)]} />}

      {praias.map(p => {
        const ativa = selecionada?.nome === p.nome
        const pos = naTela(p.lat, p.lon)
        return (
          <Pressable key={p.nome} onPress={() => aoTocarPraia(p)} hitSlop={8}
            style={[estilos.marcador, ativa && estilos.marcadorAtivo, { left: pos.left - (ativa ? 11 : 8), top: pos.top - (ativa ? 11 : 8) }]}
            accessibilityRole="button" accessibilityLabel={`${p.nome}, ${p.cidade} - ${p.uf}`} />
        )
      })}

      {selecionada && !praias.some(p => p.nome === selecionada.nome) && (
        <View pointerEvents="none" style={[estilos.marcador, estilos.marcadorAtivo, {
          left: naTela(selecionada.lat, selecionada.lon).left - 11, top: naTela(selecionada.lat, selecionada.lon).top - 11,
        }]} />
      )}

      {selecionada && (
        <View pointerEvents="none" style={[estilos.rotulo, { left: naTela(selecionada.lat, selecionada.lon).left - 80, top: naTela(selecionada.lat, selecionada.lon).top - 42 }]}>
          <Text style={estilos.rotuloTexto} numberOfLines={1}>{selecionada.nome}</Text>
        </View>
      )}

      <View style={estilos.zoom}>
        <Pressable style={estilos.zoomBotao} onPress={() => mudarZoom(1)} accessibilityRole="button" accessibilityLabel="Aproximar">
          <Text style={estilos.zoomTexto}>+</Text>
        </Pressable>
        <Pressable style={[estilos.zoomBotao, { borderTopWidth: 1, borderTopColor: '#ccc' }]} onPress={() => mudarZoom(-1)}
          accessibilityRole="button" accessibilityLabel="Afastar">
          <Text style={estilos.zoomTexto}>−</Text>
        </Pressable>
        <Pressable style={[estilos.zoomBotao, { borderTopWidth: 1, borderTopColor: '#ccc' }]} accessibilityRole="button"
          accessibilityLabel="Ver o Brasil inteiro" onPress={() => { setCentro({ lat: -15.5, lon: -47 }); setZoom(ZOOM_BRASIL) }}>
          <Icone nome="globe" tamanho={16} cor="#333" />
        </Pressable>
      </View>
      <Text style={estilos.creditos}>© OpenStreetMap</Text>
    </View>
  )
}

const estilos = StyleSheet.create({
  ladrilho: { position: 'absolute', width: TAMANHO + 1, height: TAMANHO + 1 },
  marcador: {
    position: 'absolute', width: 16, height: 16, borderRadius: 8, backgroundColor: '#0077b6',
    borderWidth: 2, borderColor: '#fff',
  },
  marcadorAtivo: { width: 22, height: 22, borderRadius: 11, backgroundColor: cores.destaque, borderWidth: 3 },
  eu: {
    position: 'absolute', width: 14, height: 14, borderRadius: 7, backgroundColor: '#2563eb',
    borderWidth: 3, borderColor: '#fff', marginLeft: -7, marginTop: -7,
  },
  rotulo: { position: 'absolute', width: 160, alignItems: 'center' },
  rotuloTexto: {
    backgroundColor: 'rgba(2,14,30,0.85)', color: '#fff', fontSize: 12, fontWeight: '700',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, overflow: 'hidden',
  },
  zoom: { position: 'absolute', right: 10, top: 10, backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden' },
  zoomBotao: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  zoomTexto: { fontSize: 20, color: '#333', fontWeight: '700' },
  creditos: {
    position: 'absolute', right: 4, bottom: 18, fontSize: 10, color: '#333',
    backgroundColor: 'rgba(255,255,255,0.8)', paddingHorizontal: 4,
  },
})

export default MapaPraias
