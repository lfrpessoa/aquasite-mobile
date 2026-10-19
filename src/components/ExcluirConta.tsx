import React, { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Campo from './Campo'
import Botao from './Botao'
import { Aviso } from './Estados'
import { contas } from '../services/api'
import { mensagemDeErro } from '../services/http'
import { perguntar } from '../utils/perguntar'
import { base, cores, espaco, raio } from '../theme/tema'

/** "Excluir minha conta" (POST /api/users/excluir-conta): pede a senha e confirma; a conta some do banco. */
const ExcluirConta = ({ aoExcluir }: { aoExcluir: () => void }) => {
  const [aberto, setAberto] = useState(false)
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const excluir = async () => {
    setEnviando(true)
    try {
      const r = await contas.excluirConta(senha)
      if (r.success) { aoExcluir(); return }
      setErro(r.error ?? 'Não foi possível excluir a conta.')
    } catch (e) {
      setErro(mensagemDeErro(e))
    }
    setEnviando(false)
  }

  const confirmar = () => perguntar('Excluir conta', 'Excluir a sua conta para sempre? Posts, mensagens, storys e seguidores somem junto, e não dá para desfazer.', [
    { text: 'Cancelar', style: 'cancel' }, { text: 'Excluir', style: 'destructive', onPress: () => void excluir() },
  ])

  return (
    <View style={estilos.cartao}>
      <Text style={estilos.titulo}>Excluir conta</Text>
      {!aberto ? (
        <Botao titulo="Excluir minha conta" icone="trash" variante="perigo" pequeno onPress={() => setAberto(true)} estilo={{ alignSelf: 'flex-start' }} />
      ) : (
        <View style={{ gap: espaco.md }}>
          <Text style={base.textoSuave}>A conta some do banco de dados com tudo que é dela. Não dá para desfazer.</Text>
          <Campo rotulo="Sua senha" senha value={senha} onChangeText={setSenha} autoComplete="current-password" />
          <View style={{ flexDirection: 'row', gap: espaco.sm, flexWrap: 'wrap' }}>
            <Botao titulo="Excluir conta para sempre" variante="perigo" pequeno onPress={confirmar} carregando={enviando} desativado={!senha} />
            <Botao titulo="Cancelar" pequeno variante="texto" onPress={() => { setAberto(false); setSenha(''); setErro(null) }} />
          </View>
        </View>
      )}
      <Aviso tipo="erro" texto={erro} />
    </View>
  )
}

const estilos = StyleSheet.create({
  cartao: { backgroundColor: cores.painel, borderRadius: raio.lg, borderWidth: 1, borderColor: cores.erro, padding: espaco.lg, gap: espaco.md },
  titulo: { color: cores.erro, fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
})

export default ExcluirConta
