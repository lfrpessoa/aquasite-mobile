import React, { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import Avatar from '../components/Avatar'
import Icone from '../components/Icone'
import ImagemAmpliavel from '../components/ImagemAmpliavel'
import { Aviso, Carregando, EstadoVazio } from '../components/Estados'
import { useEu } from '../contexts/AuthContext'
import { busca } from '../services/api'
import { mensagemDeErro } from '../services/http'
import { quandoPostou, semArroba } from '../utils/formatar'
import type { ResultadoBusca } from '../types/api'
import type { RaizParams } from '../types/navegacao'
import { base, cores, espaco, raio } from '../theme/tema'

type Props = NativeStackScreenProps<RaizParams, 'Busca'>

/** Pesquisar usuários e posts por palavra-chave (GET /api/search, o mesmo do site). */
const BuscaScreen = ({ navigation }: Props) => {
  const eu = useEu()
  const [termo, setTermo] = useState('')
  const [resultado, setResultado] = useState<ResultadoBusca | null>(null)
  const [buscando, setBuscando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const pesquisar = async () => {
    if (!termo.trim()) return
    setBuscando(true)
    setErro(null)
    try { setResultado(await busca.pesquisar(termo.trim())) } catch (e) { setErro(mensagemDeErro(e)) }
    setBuscando(false)
  }

  const abrirPerfil = (u: string) => (u === eu.username
    ? navigation.navigate('Abas', { screen: 'Perfil' })
    : navigation.navigate('Usuario', { username: u }))

  return (
    <View style={base.tela}>
      <View style={estilos.barra}>
        <Icone nome="search" tamanho={18} cor={cores.textoApagado} />
        <TextInput value={termo} onChangeText={setTermo} onSubmitEditing={pesquisar} returnKeyType="search" autoFocus
          placeholder="Pesquisar usuários ou posts..." placeholderTextColor={cores.textoApagado} style={estilos.input}
          autoCapitalize="none" accessibilityLabel="Pesquisar usuários ou posts" />
        <Pressable onPress={pesquisar} style={estilos.botao} accessibilityRole="button" accessibilityLabel="Buscar">
          <Text style={estilos.botaoTexto}>Buscar</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
        <Aviso tipo="erro" texto={erro} />
        {buscando && <Carregando texto="Buscando..." />}
        {!buscando && !resultado && <EstadoVazio icone="search" texto="Digite um nome de usuário ou uma palavra dos posts." />}
        {!buscando && resultado && (
          <>
            <Text style={base.tituloSecao}>Usuários</Text>
            {resultado.users.length === 0 && <Text style={base.textoSuave}>Nenhum usuário encontrado.</Text>}
            {resultado.users.map(u => (
              <Pressable key={u.username} style={estilos.pessoa} onPress={() => abrirPerfil(u.username)}
                accessibilityRole="button" accessibilityLabel={`Perfil de @${u.username}`}>
                <Avatar username={u.username} url={u.avatar} online={u.online} tamanho={46} />
                <View style={{ flex: 1 }}>
                  <Text style={estilos.nome}>@{u.username}</Text>
                  {!!u.bio && <Text style={base.textoSuave} numberOfLines={1}>{u.bio}</Text>}
                </View>
                <Icone nome="arrow-right" tamanho={16} cor={cores.destaque} />
              </Pressable>
            ))}
            <Text style={[base.tituloSecao, { marginTop: espaco.lg }]}>Posts</Text>
            {resultado.posts.length === 0 && <Text style={base.textoSuave}>Nenhum post encontrado.</Text>}
            {resultado.posts.map(p => (
              <View key={p.id} style={base.cartao}>
                <Text style={estilos.nome} onPress={() => abrirPerfil(semArroba(p.user))}>{p.user}</Text>
                <Text style={[base.texto, { marginTop: 6 }]}>{p.content}</Text>
                {p.image && <ImagemAmpliavel uri={p.image} descricao={`Foto publicada por ${p.user}`} estilo={estilos.imagem} />}
                <Text style={[base.textoSuave, { marginTop: 6 }]}>♥ {p.likes} · {quandoPostou(p)}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  )
}

const estilos = StyleSheet.create({
  barra: {
    flexDirection: 'row', alignItems: 'center', gap: espaco.sm, margin: espaco.lg, paddingLeft: espaco.md,
    borderRadius: raio.pilula, borderWidth: 1, borderColor: cores.bordaForte, backgroundColor: 'rgba(255,255,255,0.05)',
  },
  input: { flex: 1, color: cores.texto, fontSize: 15, minHeight: 46 },
  botao: { backgroundColor: cores.destaque, borderRadius: raio.pilula, paddingHorizontal: 18, height: 46, justifyContent: 'center' },
  botaoTexto: { color: cores.fundo, fontWeight: '700' },
  conteudo: { paddingHorizontal: espaco.lg, paddingBottom: espaco.xxl, gap: espaco.sm },
  pessoa: {
    flexDirection: 'row', alignItems: 'center', gap: espaco.md, padding: espaco.md, borderRadius: raio.lg,
    backgroundColor: cores.painel, borderWidth: 1, borderColor: cores.borda,
  },
  nome: { color: cores.destaque, fontWeight: '700', fontSize: 15 },
  imagem: { width: '100%', height: 180, borderRadius: raio.md, marginTop: 8 },
})

export default BuscaScreen
