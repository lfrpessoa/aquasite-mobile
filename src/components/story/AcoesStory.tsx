import React, { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import Avatar from '../Avatar'
import Icone from '../Icone'
import Folha from '../Folha'
import EscolherDestaque from './EscolherDestaque'
import { mensagens, storys } from '../../services/api'
import { mensagemDeErro } from '../../services/http'
import { perguntar } from '../../utils/perguntar'
import { tempoAtras } from '../../utils/formatar'
import type { ControleVisor } from './VisorStory'
import type { GrupoVisor, ItemVisor } from '../../utils/storys'
import type { PessoaQueViu } from '../../types/api'
import { cores, espaco } from '../../theme/tema'

interface Props {
  grupo: GrupoVisor
  item: ItemVisor
  eu: string
  controle: ControleVisor
  aoApagar: (item: ItemVisor) => void
  aoAbrirPerfil: (username: string) => void
}

/**
 * Parte de baixo do visor de storys (igual ao site).
 * Story meu: "Visto por N", "Destaque" e "Apagar". Story de outra pessoa: responder por mensagem direta.
 */
const AcoesStory = ({ grupo, item, eu, controle, aoApagar, aoAbrirPerfil }: Props) => {
  const [quemViu, setQuemViu] = useState<PessoaQueViu[] | null>(null)
  const [guardar, setGuardar] = useState(false)
  const [resposta, setResposta] = useState('')
  const [aviso, setAviso] = useState('')

  if (grupo.meu) {
    const abrirQuemViu = async () => {
      controle.pausar()
      try { setQuemViu((await storys.quemViu(item.id)).pessoas) } catch (e) { setAviso(mensagemDeErro(e)); controle.retomar() }
    }
    const apagar = () => {
      controle.pausar()
      perguntar('Apagar story', 'Apagar este story?', [
        { text: 'Cancelar', style: 'cancel', onPress: controle.retomar },
        { text: 'Apagar', style: 'destructive', onPress: () => { storys.apagar(item.id).then(() => aoApagar(item)).catch(e => { setAviso(mensagemDeErro(e)); controle.retomar() }) } },
      ])
    }
    return (
      <>
        <Botao icone="eye" texto={`Visto por ${item.visualizacoes ?? 0}`} onPress={() => void abrirQuemViu()} />
        <View style={{ flex: 1 }}>{!!aviso && <Text style={estilos.aviso}>{aviso}</Text>}</View>
        <Botao icone="bookmark" texto="Destaque" onPress={() => { controle.pausar(); setGuardar(true) }} />
        <Botao icone="trash" texto="Apagar" onPress={apagar} />

        <Folha visivel={quemViu !== null} titulo="Quem viu" aoFechar={() => { setQuemViu(null); controle.retomar() }}>
          {quemViu?.length === 0 && <Text style={{ color: cores.textoApagado }}>Ninguém viu ainda.</Text>}
          {quemViu?.map(p => (
            <Pressable key={p.username} style={estilos.pessoa} onPress={() => { controle.fechar(); aoAbrirPerfil(p.username) }}
              accessibilityRole="link" accessibilityLabel={`Perfil de @${p.username}`}>
              <Avatar username={p.username} url={p.avatar} tamanho={36} />
              <Text style={estilos.pessoaNome}>@{p.username}</Text>
              <Text style={estilos.pessoaHora}>{tempoAtras(p.visto_em)}</Text>
            </Pressable>
          ))}
        </Folha>
        {guardar && <EscolherDestaque visivel username={eu} item={{ tipo: 'story', id: item.id }}
          aoFechar={() => { setGuardar(false); controle.retomar() }} aoConcluir={setAviso} />}
      </>
    )
  }

  const responder = async () => {
    const texto = resposta.trim()
    if (!texto) return
    try {
      await mensagens.enviar(grupo.chave, `Respondeu ao seu story: "${texto}"`, null)
      setResposta('')
      setAviso(`Resposta enviada para @${grupo.chave}.`)
    } catch (e) { setAviso(mensagemDeErro(e)) }
    controle.retomar()
  }

  return (
    <View style={estilos.responder}>
      <TextInput value={resposta} onChangeText={setResposta} maxLength={500} onFocus={controle.pausar}
        onBlur={() => { if (!resposta) controle.retomar() }} onSubmitEditing={() => void responder()} returnKeyType="send"
        placeholder={aviso || `Responder a @${grupo.chave}…`} placeholderTextColor="rgba(255,255,255,0.7)" style={estilos.campo}
        accessibilityLabel={`Responder a @${grupo.chave}`} />
      {!!resposta.trim() && (
        <Pressable onPress={() => void responder()} accessibilityRole="button" accessibilityLabel="Enviar resposta" hitSlop={8}>
          <Text style={estilos.enviar}>Enviar</Text>
        </Pressable>
      )}
    </View>
  )
}

const Botao = ({ icone, texto, onPress }: { icone: 'eye' | 'bookmark' | 'trash'; texto: string; onPress: () => void }) => (
  <Pressable onPress={onPress} style={estilos.botao} accessibilityRole="button" accessibilityLabel={texto} hitSlop={6}>
    <Icone nome={icone} tamanho={22} cor="#ffffff" />
    <Text style={estilos.botaoTexto}>{texto}</Text>
  </Pressable>
)

const estilos = StyleSheet.create({
  botao: { alignItems: 'center', gap: 3, paddingHorizontal: 6 },
  botaoTexto: { color: '#fff', fontSize: 11 },
  aviso: { color: '#4ecdc4', fontSize: 12, textAlign: 'center' },
  pessoa: { flexDirection: 'row', alignItems: 'center', gap: espaco.md, paddingVertical: 4 },
  pessoaNome: { color: cores.texto, fontWeight: '700', flex: 1 },
  pessoaHora: { color: cores.textoApagado, fontSize: 12 },
  responder: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  campo: { flex: 1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.55)', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, color: '#fff', fontSize: 14 },
  enviar: { color: '#00d4ff', fontWeight: '700' },
})

export default AcoesStory
