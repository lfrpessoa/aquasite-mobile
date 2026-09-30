import React, { useEffect, useRef } from 'react'
import { StyleSheet } from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import type { MapPressEvent } from 'react-native-maps'
import type { Local } from '../utils/praias'
import { cores } from '../theme/tema'

export interface PropsMapa {
  praias: Local[]
  selecionada: Local | null
  eu: { lat: number; lon: number } | null
  aoTocarPraia: (p: Local) => void
  aoTocarPonto: (lat: number, lon: number) => void
}

/** Mapa nativo (Google Maps no Android, Apple Maps no iOS) com as praias em destaque. */
const MapaPraias = ({ praias, selecionada, eu, aoTocarPraia, aoTocarPonto }: PropsMapa) => {
  const mapa = useRef<MapView>(null)

  useEffect(() => {
    if (selecionada) {
      mapa.current?.animateToRegion({ latitude: selecionada.lat, longitude: selecionada.lon, latitudeDelta: 0.12, longitudeDelta: 0.12 }, 600)
    }
  }, [selecionada])

  return (
    <MapView
      ref={mapa}
      style={StyleSheet.absoluteFill}
      initialRegion={{ latitude: -15.5, longitude: -45, latitudeDelta: 32, longitudeDelta: 32 }}
      showsUserLocation={!!eu}
      onPress={(e: MapPressEvent) => aoTocarPonto(e.nativeEvent.coordinate.latitude, e.nativeEvent.coordinate.longitude)}
      accessibilityLabel="Mapa do litoral brasileiro. Toque numa praia ou em qualquer ponto"
    >
      {praias.map(p => (
        <Marker key={p.nome} coordinate={{ latitude: p.lat, longitude: p.lon }} title={p.nome} description={`${p.cidade} - ${p.uf}`}
          pinColor={selecionada?.nome === p.nome ? cores.destaque : '#0077b6'} onPress={() => aoTocarPraia(p)} />
      ))}
      {selecionada && !praias.some(p => p.nome === selecionada.nome) && (
        <Marker coordinate={{ latitude: selecionada.lat, longitude: selecionada.lon }} title={selecionada.nome} pinColor={cores.destaque} />
      )}
    </MapView>
  )
}

export default MapaPraias
