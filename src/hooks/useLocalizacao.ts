import { useEffect, useState } from 'react'
import * as Location from 'expo-location'

type EstadoLocalizacao =
  | { estado: 'carregando' }
  | { estado: 'negado' }
  | { estado: 'erro' }
  | { estado: 'ok'; lat: number; lon: number }

/**
 * Pede a localização do aparelho (só enquanto o app está aberto), como o site faz pelo navegador.
 * Ela serve só para achar a praia mais próxima e calcular a distância; não é enviada à API.
 */
export function useLocalizacao(ligado = true): EstadoLocalizacao {
  const [loc, setLoc] = useState<EstadoLocalizacao>({ estado: 'carregando' })

  useEffect(() => {
    if (!ligado) return
    let cancelado = false
    ;(async () => {
      try {
        const { granted } = await Location.requestForegroundPermissionsAsync()
        if (!granted) { if (!cancelado) setLoc({ estado: 'negado' }); return }
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
        if (!cancelado) setLoc({ estado: 'ok', lat: pos.coords.latitude, lon: pos.coords.longitude })
      } catch {
        if (!cancelado) setLoc({ estado: 'erro' })
      }
    })()
    return () => { cancelado = true }
  }, [ligado])

  return loc
}
