import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { cores } from '../theme/tema'
import { semArroba } from '../utils/formatar'

interface Props {
  username: string
  url?: string | null
  tamanho?: number
  online?: boolean
}

/** Foto de perfil (vem da API em /avatars/...) ou a inicial do nome quando não há foto. */
const Avatar = ({ username, url, tamanho = 44, online }: Props) => {
  const nome = semArroba(username)
  const bolinha = Math.max(10, tamanho * 0.26)
  return (
    <View style={{ width: tamanho, height: tamanho }} accessible accessibilityLabel={`Foto de @${nome}${online ? ', online' : ''}`}>
      {url ? (
        <Image source={{ uri: url }} cachePolicy="memory-disk" contentFit="cover" style={[estilos.redondo, { width: tamanho, height: tamanho, borderRadius: tamanho / 2 }]} />
      ) : (
        <View style={[estilos.redondo, estilos.semFoto, { width: tamanho, height: tamanho, borderRadius: tamanho / 2 }]}>
          <Text style={[estilos.inicial, { fontSize: tamanho * 0.42 }]}>{(nome[0] ?? '?').toUpperCase()}</Text>
        </View>
      )}
      {online && (
        <View style={[estilos.online, { width: bolinha, height: bolinha, borderRadius: bolinha / 2 }]} />
      )}
    </View>
  )
}

const estilos = StyleSheet.create({
  redondo: { borderWidth: 1.5, borderColor: 'rgba(0,212,255,0.3)' },
  semFoto: { backgroundColor: '#0b4f6c', alignItems: 'center', justifyContent: 'center' },
  inicial: { color: cores.branco, fontWeight: '700' },
  online: { position: 'absolute', right: 0, bottom: 0, backgroundColor: '#22c55e', borderWidth: 2, borderColor: cores.fundo },
})

export default Avatar
