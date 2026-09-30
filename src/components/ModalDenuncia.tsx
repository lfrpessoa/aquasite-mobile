import React, { useState } from 'react'
import { Text } from 'react-native'
import Folha from './Folha'
import Chips from './Chips'
import Campo from './Campo'
import Botao from './Botao'
import { Aviso } from './Estados'
import { denuncias } from '../services/api'
import { mensagemDeErro } from '../services/http'
import { MOTIVOS } from '../data/conteudo'
import type { MotivoDenuncia } from '../types/api'
import { base } from '../theme/tema'

interface Props {
  visivel: boolean
  aoFechar: () => void
  alvo: { tipo: 'post'; postId: number } | { tipo: 'usuario'; username: string }
}

/** Denunciar post ou usuário (POST /api/denuncias). 3 denúncias de pessoas diferentes ocultam um post. */
const ModalDenuncia = ({ visivel, aoFechar, alvo }: Props) => {
  const [motivo, setMotivo] = useState<MotivoDenuncia>('spam')
  const [descricao, setDescricao] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)

  const fechar = () => { setResultado(null); setDescricao(''); aoFechar() }

  const enviar = async () => {
    setEnviando(true)
    try {
      const r = await denuncias.enviar({
        tipo: alvo.tipo, motivo, descricao: descricao.trim() || undefined,
        ...(alvo.tipo === 'post' ? { alvoPostId: alvo.postId } : { alvoUsuario: alvo.username }),
      })
      if (!r.success) setResultado({ tipo: 'erro', texto: r.error ?? 'Não foi possível enviar.' })
      else setResultado({
        tipo: 'ok',
        texto: r.jaDenunciado ? 'Você já tinha denunciado este post. A equipe vai analisar.'
          : 'Denúncia enviada. Obrigado por ajudar a manter a comunidade segura.',
      })
    } catch (e) {
      setResultado({ tipo: 'erro', texto: mensagemDeErro(e) })
    }
    setEnviando(false)
  }

  return (
    <Folha visivel={visivel} titulo={alvo.tipo === 'post' ? 'Denunciar post' : `Denunciar @${alvo.username}`} aoFechar={fechar}>
      <Text style={base.textoSuave}>Motivo</Text>
      <Chips opcoes={MOTIVOS} valor={motivo} aoMudar={setMotivo} rolavel={false} rotulo="Motivo da denúncia" />
      <Campo rotulo="Detalhes (opcional)" value={descricao} onChangeText={setDescricao} multiline
        placeholder="Descreva o que está acontecendo..." maxLength={500} />
      <Aviso tipo={resultado?.tipo} texto={resultado?.texto} />
      {resultado?.tipo === 'ok'
        ? <Botao titulo="Fechar" onPress={fechar} variante="secundario" />
        : <Botao titulo="Enviar denúncia" onPress={enviar} variante="perigo" icone="flag" carregando={enviando} />}
    </Folha>
  )
}

export default ModalDenuncia
