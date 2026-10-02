import React, { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Botao from './Botao'
import Campo from './Campo'
import { Aviso } from './Estados'
import { contas } from '../services/api'
import { mensagemDeErro } from '../services/http'
import { cores, espaco } from '../theme/tema'

/**
 * "Esqueci minha senha" (igual ao site): a pessoa informa o e-mail ou o nome de usuário e a API manda
 * um link para criar uma senha nova. O link abre a página /redefinir-senha do site.
 * A resposta é sempre a mesma, exista a conta ou não.
 */
const EsqueciSenha = () => {
  const [aberto, setAberto] = useState(false)
  const [login, setLogin] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [msg, setMsg] = useState<{ erro: boolean; texto: string } | null>(null)

  const enviar = async () => {
    if (!login.trim()) return
    setEnviando(true)
    setMsg(null)
    try {
      const r = await contas.esqueciSenha(login.trim())
      setMsg(r.success ? { erro: false, texto: r.mensagem ?? 'Enviamos um link para o seu e-mail.' } : { erro: true, texto: r.error ?? 'Não foi possível enviar agora.' })
      if (r.success) setLogin('')
    } catch (e) {
      setMsg({ erro: true, texto: mensagemDeErro(e) })
    }
    setEnviando(false)
  }

  return (
    <View style={estilos.caixa}>
      <Botao titulo="Esqueci minha senha" variante="texto" pequeno onPress={() => setAberto(a => !a)} />
      {aberto && (
        <View style={{ gap: espaco.sm }}>
          <Text style={estilos.texto}>Informe o e-mail ou o nome de usuário da sua conta. Vamos enviar um link para você criar uma senha nova.</Text>
          <Campo value={login} onChangeText={setLogin} placeholder="E-mail ou nome de usuário" autoCapitalize="none"
            keyboardType="email-address" autoComplete="email" accessibilityLabel="E-mail ou nome de usuário" />
          <Botao titulo="Enviar link" pequeno onPress={() => void enviar()} carregando={enviando} desativado={!login.trim()} />
          <Aviso tipo={msg?.erro ? 'erro' : 'ok'} texto={msg?.texto} />
          <Text style={estilos.texto}>Não tem mais acesso ao e-mail? Peça a um administrador do AquaSite uma senha temporária.</Text>
        </View>
      )}
    </View>
  )
}

const estilos = StyleSheet.create({
  caixa: { gap: espaco.sm },
  texto: { color: cores.textoSuave, fontSize: 13, lineHeight: 19, textAlign: 'center' },
})

export default EsqueciSenha
