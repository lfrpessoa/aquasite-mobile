import React, { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'
import Folha from '../Folha'
import Botao from '../Botao'
import Campo from '../Campo'
import { Aviso } from '../Estados'
import { storys } from '../../services/api'
import { mensagemDeErro } from '../../services/http'
import { escolherImagem } from '../../utils/imagem'
import { MAX_TEXTO_STORY } from '../../utils/storys'
import type { Story } from '../../types/api'
import { cores, espaco, raio } from '../../theme/tema'

interface Props {
  visivel: boolean
  aoFechar: () => void
  aoPublicar?: (story: Story) => void
}

/**
 * "Novo story": escolhe uma foto da galeria (ou tira com a câmera), escreve um texto opcional e publica.
 * A foto é reduzida no aparelho antes do envio (até 1080 px, em JPEG), como nos posts.
 */
const NovoStory = ({ visivel, aoFechar, aoPublicar }: Props) => {
  const [foto, setFoto] = useState<string | null>(null)
  const [texto, setTexto] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const fechar = () => { setFoto(null); setTexto(''); setErro(null); aoFechar() }

  const escolher = async (origem: 'galeria' | 'camera') => {
    setErro(null)
    try {
      const f = await escolherImagem(origem)
      if (f) setFoto(f)
    } catch (e) { setErro(mensagemDeErro(e)) }
  }

  const publicar = async () => {
    if (!foto) return
    setEnviando(true)
    setErro(null)
    try {
      const story = await storys.publicar(foto, texto.trim())
      aoPublicar?.(story)
      fechar()
    } catch (e) { setErro(mensagemDeErro(e)) }
    setEnviando(false)
  }

  return (
    <Folha visivel={visivel} titulo="Novo story" aoFechar={fechar}>
      {foto ? (
        <View style={estilos.previa}>
          <Image source={{ uri: foto }} style={StyleSheet.absoluteFill} contentFit="contain" accessibilityLabel="Prévia do story" />
          {!!texto.trim() && <View style={estilos.legenda}><Text style={estilos.legendaTexto}>{texto}</Text></View>}
        </View>
      ) : (
        <Text style={estilos.dica}>Escolha uma foto da galeria ou tire uma com a câmera. O story fica no ar por 24 horas para quem segue você.</Text>
      )}
      <View style={estilos.fontes}>
        <Botao titulo="Galeria" icone="image" variante="secundario" pequeno onPress={() => void escolher('galeria')} estilo={{ flex: 1 }} />
        <Botao titulo="Câmera" icone="camera" variante="secundario" pequeno onPress={() => void escolher('camera')} estilo={{ flex: 1 }} />
      </View>
      <Campo rotulo="Texto (opcional)" value={texto} onChangeText={setTexto} maxLength={MAX_TEXTO_STORY} placeholder="Escreva algo sobre a foto…" />
      <Text style={estilos.conta}>{texto.length}/{MAX_TEXTO_STORY} · some depois de 24 horas</Text>
      <Aviso tipo="erro" texto={erro} />
      <Botao titulo="Compartilhar story" onPress={() => void publicar()} carregando={enviando} desativado={!foto} />
    </Folha>
  )
}

const estilos = StyleSheet.create({
  previa: { height: 320, borderRadius: raio.lg, overflow: 'hidden', backgroundColor: '#000' },
  legenda: { position: 'absolute', top: '18%', alignSelf: 'center', maxWidth: '86%', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
  legendaTexto: { color: '#fff', fontWeight: '700', fontSize: 15, textAlign: 'center' },
  dica: { color: cores.textoSuave, fontSize: 14, lineHeight: 20 },
  fontes: { flexDirection: 'row', gap: espaco.sm },
  conta: { color: cores.textoApagado, fontSize: 12, marginTop: -espaco.sm },
})

export default NovoStory
