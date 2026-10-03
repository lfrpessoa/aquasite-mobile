import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'
import Icone from '../Icone'
import { corDoPostTexto } from '../../utils/storys'
import type { Post } from '../../types/api'
import { cores, espaco } from '../../theme/tema'

/** Abas "Grade" e "Lista" do perfil (iguais às do site). */
export const AbasPerfil = ({ aba, aoMudar }: { aba: 'grade' | 'lista'; aoMudar: (a: 'grade' | 'lista') => void }) => (
  <View style={estilos.abas} accessibilityRole="tablist">
    {(['grade', 'lista'] as const).map(a => (
      <Pressable key={a} style={[estilos.aba, aba === a && estilos.abaAtiva]} onPress={() => aoMudar(a)}
        accessibilityRole="tab" accessibilityState={{ selected: aba === a }}>
        <Icone nome={a === 'grade' ? 'grid' : 'list'} tamanho={16} cor={aba === a ? cores.destaque : cores.textoApagado} />
        <Text style={[estilos.abaTexto, aba === a && { color: cores.destaque }]}>{a === 'grade' ? 'GRADE' : 'LISTA'}</Text>
      </Pressable>
    ))}
  </View>
)

/** Posts do perfil em mosaico de 3 colunas. Tocar abre o post. */
const GradePosts = ({ posts, aoAbrir, vazio = 'Nenhum post ainda.' }: { posts: Post[]; aoAbrir: (p: Post) => void; vazio?: string }) => {
  if (posts.length === 0) return <Text style={estilos.vazio}>{vazio}</Text>
  return (
    <View style={estilos.grade}>
      {posts.map(p => {
        const [a] = corDoPostTexto(p.id)
        return (
          <Pressable key={p.id} style={estilos.tile} onPress={() => aoAbrir(p)} accessibilityRole="button"
            accessibilityLabel={`${p.fixado ? 'Post fixado: ' : 'Post: '}${(p.content || 'foto').slice(0, 60)}`}>
            {p.image
              ? <Image source={{ uri: p.image }} style={StyleSheet.absoluteFill} contentFit="cover" cachePolicy="memory-disk" />
              : <View style={[StyleSheet.absoluteFill, estilos.texto, { backgroundColor: a }]}><Text style={estilos.textoPost} numberOfLines={4}>{p.content}</Text></View>}
            {p.fixado ? <View style={estilos.marca}><Icone nome="pin" tamanho={14} cor="#fff" preenchimento="#fff" /></View>
              : p.gif ? <View style={estilos.marca}><Text style={estilos.gif}>GIF</Text></View> : null}
            {p.oculto && <Text style={estilos.oculto}>oculto</Text>}
          </Pressable>
        )
      })}
    </View>
  )
}

const estilos = StyleSheet.create({
  abas: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: cores.borda, marginTop: espaco.sm },
  aba: { flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderTopWidth: 2, borderTopColor: 'transparent', marginTop: -1 },
  abaAtiva: { borderTopColor: cores.destaque },
  abaTexto: { color: cores.textoApagado, fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
  tile: { width: '32.9%', aspectRatio: 1, overflow: 'hidden', backgroundColor: cores.painelClaro },
  texto: { alignItems: 'center', justifyContent: 'center', padding: 6 },
  textoPost: { color: '#fff', fontSize: 11, fontWeight: '700', textAlign: 'center' },
  marca: { position: 'absolute', top: 5, right: 5 },
  gif: { color: '#fff', fontSize: 9, fontWeight: '900', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 4, paddingHorizontal: 4, overflow: 'hidden' },
  oculto: { position: 'absolute', left: 4, bottom: 4, color: '#fff', fontSize: 9, backgroundColor: 'rgba(255,107,107,0.85)', borderRadius: 999, paddingHorizontal: 6, overflow: 'hidden' },
  vazio: { color: cores.textoApagado, textAlign: 'center', paddingVertical: espaco.xl },
})

export default GradePosts
