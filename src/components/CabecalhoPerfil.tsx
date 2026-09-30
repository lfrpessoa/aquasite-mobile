import React from 'react'
import type { ReactNode } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Avatar from './Avatar'
import Icone from './Icone'
import type { PerfilStats } from '../types/api'
import { cores, espaco, raio } from '../theme/tema'

interface Props {
  username: string
  perfil: PerfilStats
  aoTocarFoto?: () => void
  aoTocarNome?: () => void
  aoAbrirLista: (aba: 'seguidores' | 'seguindo') => void
  children?: ReactNode
}

/** Topo do perfil (meu ou de outra pessoa): foto, nome, data de entrada e números. */
const CabecalhoPerfil = ({ username, perfil, aoTocarFoto, aoTocarNome, aoAbrirLista, children }: Props) => (
  <View style={estilos.cartao}>
    <Pressable onPress={aoTocarFoto} disabled={!aoTocarFoto} accessibilityRole={aoTocarFoto ? 'button' : undefined}
      accessibilityLabel={aoTocarFoto ? 'Trocar foto de perfil' : undefined}>
      <Avatar username={username} url={perfil.avatar} tamanho={92} online={perfil.online} />
    </Pressable>
    <Pressable onPress={aoTocarNome} disabled={!aoTocarNome} accessibilityRole={aoTocarNome ? 'button' : 'header'}
      accessibilityLabel={aoTocarNome ? `@${username}. Toque para mudar o nome de usuário` : `@${username}`}>
      <View style={estilos.linhaNome}>
        <Text style={estilos.nome}>@{username}</Text>
        {aoTocarNome && <Icone nome="pencil" tamanho={16} cor={cores.textoApagado} />}
      </View>
    </Pressable>
    <Text style={estilos.desde}>Membro desde {perfil.joinDate}</Text>
    {!!perfil.bio && <Text style={estilos.bio}>{perfil.bio}</Text>}
    <View style={estilos.numeros}>
      <View style={estilos.numero} accessible accessibilityLabel={`${perfil.postsCount} posts`}>
        <Text style={estilos.valor}>{perfil.postsCount}</Text><Text style={estilos.rotulo}>Posts</Text>
      </View>
      <Pressable style={estilos.numero} onPress={() => aoAbrirLista('seguidores')} accessibilityRole="button"
        accessibilityLabel={`${perfil.followersCount} seguidores. Ver lista`}>
        <Text style={estilos.valor}>{perfil.followersCount}</Text><Text style={estilos.rotulo}>Seguidores</Text>
      </Pressable>
      <Pressable style={estilos.numero} onPress={() => aoAbrirLista('seguindo')} accessibilityRole="button"
        accessibilityLabel={`Segue ${perfil.followingCount}. Ver lista`}>
        <Text style={estilos.valor}>{perfil.followingCount}</Text><Text style={estilos.rotulo}>Seguindo</Text>
      </Pressable>
    </View>
    {children}
  </View>
)

const estilos = StyleSheet.create({
  cartao: {
    alignItems: 'center', gap: espaco.sm, backgroundColor: cores.painel, borderRadius: raio.lg + 4,
    borderWidth: 1, borderColor: cores.borda, padding: espaco.xl,
  },
  linhaNome: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: espaco.sm },
  nome: { color: cores.texto, fontSize: 22, fontWeight: '800' },
  desde: { color: cores.textoApagado, fontSize: 13 },
  bio: { color: cores.textoSuave, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  numeros: { flexDirection: 'row', alignSelf: 'stretch', justifyContent: 'space-around', marginTop: espaco.md },
  numero: { alignItems: 'center', minWidth: 80, paddingVertical: 4 },
  valor: { color: cores.destaque, fontSize: 22, fontWeight: '800' },
  rotulo: { color: cores.textoApagado, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
})

export default CabecalhoPerfil
