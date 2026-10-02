import React, { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Campo from './Campo'
import Botao from './Botao'
import { Aviso } from './Estados'
import { contas } from '../services/api'
import { mensagemDeErro } from '../services/http'
import { cores, espaco, raio } from '../theme/tema'

/** "Trocar senha" (PUT /api/users/senha). Abre sozinho quando a pessoa entrou com senha temporária. */
const TrocarSenha = ({ obrigatoria, aoTrocar }: { obrigatoria: boolean; aoTrocar: () => void }) => {
  const [aberto, setAberto] = useState(obrigatoria)
  const [atual, setAtual] = useState('')
  const [nova, setNova] = useState('')
  const [confirma, setConfirma] = useState('')
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)
  const [enviando, setEnviando] = useState(false)

  const salvar = async () => {
    if (nova !== confirma) { setMsg({ tipo: 'erro', texto: 'A confirmação não é igual à nova senha.' }); return }
    setEnviando(true)
    try {
      const r = await contas.trocarSenha(atual, nova)
      if (r.success) {
        setMsg({ tipo: 'ok', texto: 'Senha alterada. Use a nova senha no próximo login.' })
        setAtual(''); setNova(''); setConfirma('')
        aoTrocar()
      } else setMsg({ tipo: 'erro', texto: r.error ?? 'Não foi possível trocar a senha.' })
    } catch (e) {
      setMsg({ tipo: 'erro', texto: mensagemDeErro(e) })
    }
    setEnviando(false)
  }

  return (
    <View style={estilos.cartao}>
      <Text style={estilos.titulo}>Senha</Text>
      {obrigatoria && <Aviso tipo="atencao" texto="Você entrou com uma senha temporária. Escolha uma senha nova agora." />}
      {!aberto ? (
        <Botao titulo="Trocar senha" icone="lock" variante="secundario" pequeno onPress={() => setAberto(true)} estilo={{ alignSelf: 'flex-start' }} />
      ) : (
        <View style={{ gap: espaco.md }}>
          <Campo rotulo={`Senha atual${obrigatoria ? ' (a temporária)' : ''}`} senha value={atual} onChangeText={setAtual} autoComplete="current-password" />
          <Campo rotulo="Nova senha" senha value={nova} onChangeText={setNova} maxLength={16} autoComplete="new-password"
            dica="Entre 8 e 16 caracteres, com pelo menos uma letra e um número ou símbolo." />
          <Campo rotulo="Confirmar nova senha" senha value={confirma} onChangeText={setConfirma} maxLength={16} />
          <View style={{ flexDirection: 'row', gap: espaco.sm }}>
            <Botao titulo="Salvar nova senha" pequeno onPress={salvar} carregando={enviando} desativado={!atual || !nova} />
            {!obrigatoria && <Botao titulo="Cancelar" pequeno variante="texto" onPress={() => { setAberto(false); setMsg(null) }} />}
          </View>
        </View>
      )}
      <Aviso tipo={msg?.tipo} texto={msg?.texto} />
    </View>
  )
}

const estilos = StyleSheet.create({
  cartao: { backgroundColor: cores.painel, borderRadius: raio.lg, borderWidth: 1, borderColor: cores.borda, padding: espaco.lg, gap: espaco.md },
  titulo: { color: cores.destaque, fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
})

export default TrocarSenha
