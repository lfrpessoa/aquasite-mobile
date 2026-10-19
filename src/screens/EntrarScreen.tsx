import React, { useState } from 'react'
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Campo from '../components/Campo'
import Botao from '../components/Botao'
import Icone from '../components/Icone'
import { Aviso } from '../components/Estados'
import EsqueciSenha from '../components/EsqueciSenha'
import { useAuth } from '../contexts/AuthContext'
import { mensagemDeErro } from '../services/http'
import { escolherImagem } from '../utils/imagem'
import { forcaDaSenha } from '../utils/senha'
import { cores, espaco, raio } from '../theme/tema'


/** Entrar ou criar conta — a mesma conta vale no site e no app (mesma API, mesmo banco). */
const EntrarScreen = () => {
  const { entrar, cadastrar, sessaoExpirada } = useAuth()
  const [modo, setModo] = useState<'entrar' | 'cadastrar'>('entrar')
  const [login, setLogin] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [bio, setBio] = useState('')
  const [foto, setFoto] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const forca = forcaDaSenha(senha)

  const trocarModo = () => { setModo(m => (m === 'entrar' ? 'cadastrar' : 'entrar')); setErro(null); setSenha('') }

  const escolherFoto = async () => {
    try { const f = await escolherImagem('galeria', true); if (f) setFoto(f) } catch (e) { setErro(mensagemDeErro(e)) }
  }

  const enviar = async () => {
    setErro(null)
    if (modo === 'entrar') {
      if (!login.trim() || !senha) { setErro('Preencha usuário (ou e-mail) e senha.'); return }
    } else {
      if (!username.trim() || !email.trim() || !senha) { setErro('Preencha nome de usuário, e-mail e senha.'); return }
      if (!/^[a-zA-Z0-9_.]+$/.test(username.trim())) { setErro('O nome de usuário só pode ter letras, números, _ e .'); return }
      if (!/.+@.+\..+/.test(email.trim())) { setErro('Informe um e-mail válido.'); return }
    }
    setEnviando(true)
    try {
      const r = modo === 'entrar'
        ? await entrar(login, senha)
        : await cadastrar({ username: username.trim(), email: email.trim(), password: senha, bio: bio.trim() || undefined, avatar: foto })
      // se deu certo, a navegação troca sozinha para as abas (RootNavigator); com senha temporária abre no Perfil
      if (!r.ok) setErro(r.erro ?? 'Não foi possível entrar.')
    } catch (e) {
      setErro(mensagemDeErro(e))
    }
    setEnviando(false)
  }

  return (
    <SafeAreaView style={estilos.tela} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
          <View style={estilos.marca}>
            <Icone nome="waves" tamanho={48} cor={cores.destaque} />
            <Text style={estilos.logo} accessibilityRole="header">AquaSite</Text>
            <Text style={estilos.slogan}>Uma rede social sobre vida marinha e conservação dos oceanos</Text>
          </View>

          <View style={estilos.cartao}>
            <Text style={estilos.titulo}>{modo === 'entrar' ? 'Entrar' : 'Criar conta'}</Text>
            {sessaoExpirada && modo === 'entrar' && <Aviso tipo="atencao" texto="Sua sessão expirou. Entre de novo para continuar." />}

            {modo === 'entrar' ? (
              <Campo rotulo="Usuário ou e-mail" value={login} onChangeText={setLogin} autoCapitalize="none"
                autoComplete="username" textContentType="username" placeholder="marina.alves" />
            ) : (
              <>
                <Pressable onPress={escolherFoto} style={estilos.foto} accessibilityRole="button"
                  accessibilityLabel={foto ? 'Trocar foto de perfil' : 'Escolher foto de perfil (opcional)'}>
                  {foto ? <Image source={{ uri: foto }} style={estilos.fotoImg} />
                    : <Icone nome="camera" tamanho={28} cor={cores.destaque} />}
                </Pressable>
                <Text style={estilos.fotoDica}>Foto de perfil (opcional)</Text>
                <Campo rotulo="Nome de usuário" value={username} onChangeText={setUsername} autoCapitalize="none"
                  autoCorrect={false} placeholder="ex.: ana.marinha" maxLength={50} />
                <Campo rotulo="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none"
                  keyboardType="email-address" autoComplete="email" placeholder="voce@email.com" />
                <Campo rotulo="Biografia (opcional)" value={bio} onChangeText={setBio} multiline maxLength={300} />
              </>
            )}

            <Campo rotulo="Senha" value={senha} onChangeText={setSenha} senha maxLength={16}
              autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'} />

            {modo === 'cadastrar' && senha.length > 0 && (
              <View style={{ gap: 4 }} accessibilityLiveRegion="polite">
                <Text style={{ color: forca.cor, fontWeight: '700', fontSize: 13 }}>{forca.rotulo}</Text>
                <View style={estilos.barra}><View style={[estilos.barraCheia, { width: `${forca.fracao * 100}%`, backgroundColor: forca.cor }]} /></View>
                {([
                  [forca.tamanhoOk, 'Entre 8 e 16 caracteres'],
                  [forca.temLetra, 'Pelo menos uma letra'],
                  [forca.temNumeroOuSimbolo, 'Pelo menos um número ou símbolo'],
                ] as const).map(([ok, texto]) => (
                  <View key={texto} style={estilos.regra}>
                    <Icone nome={ok ? 'check' : 'x'} tamanho={14} cor={ok ? cores.ok : cores.erro} espessura={3} />
                    <Text style={{ color: ok ? cores.ok : cores.erro, fontSize: 12 }}>{texto}</Text>
                  </View>
                ))}
              </View>
            )}

            <Aviso tipo="erro" texto={erro} />
            <Botao titulo={modo === 'entrar' ? 'Entrar' : 'Criar conta'} onPress={enviar} carregando={enviando} />

            {modo === 'entrar' && <EsqueciSenha />}
          </View>

          <Botao titulo={modo === 'entrar' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entrar'} variante="secundario" onPress={trocarModo} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.xl, gap: espaco.lg, flexGrow: 1, justifyContent: 'center' },
  marca: { alignItems: 'center', gap: espaco.sm, marginBottom: espaco.sm },
  logo: { color: cores.destaque, fontSize: 38, fontWeight: '800', letterSpacing: 0.5 },
  slogan: { color: cores.textoSuave, textAlign: 'center', fontSize: 14, lineHeight: 20 },
  cartao: { backgroundColor: cores.painel, borderRadius: raio.lg + 4, borderWidth: 1, borderColor: cores.borda, padding: espaco.xl, gap: espaco.md },
  titulo: { color: cores.texto, fontSize: 22, fontWeight: '700' },
  foto: {
    alignSelf: 'center', width: 88, height: 88, borderRadius: 44, borderWidth: 2, borderColor: cores.destaque,
    backgroundColor: cores.destaqueFundo, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  fotoImg: { width: 88, height: 88 },
  fotoDica: { color: cores.textoApagado, fontSize: 12, textAlign: 'center', marginTop: -6 },
  barra: { height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  barraCheia: { height: 4 },
  regra: { flexDirection: 'row', alignItems: 'center', gap: 6 },
})

export default EntrarScreen
