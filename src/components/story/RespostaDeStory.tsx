import React, { useState } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { cores, raio } from '../../theme/tema'

interface Props {
  uri: string
  minha: boolean
  outro: string
}

/**
 * Acima da mensagem que respondeu a um story (como no Instagram): quem respondeu e a miniatura do story.
 * Depois que o story vence (e não está em destaque) a API devolve 404 e aparece "Story indisponível".
 */
const RespostaDeStory = ({ uri, minha, outro }: Props) => {
  const [indisponivel, setIndisponivel] = useState(false)
  return (
    <View style={[estilos.caixa, { alignItems: minha ? 'flex-end' : 'flex-start' }]}>
      <Text style={estilos.rotulo}>{minha ? `Você respondeu ao story de @${outro}` : 'Respondeu ao seu story'}</Text>
      <View style={[estilos.linha, { flexDirection: minha ? 'row-reverse' : 'row' }]}>
        <View style={estilos.barra} />
        {indisponivel ? (
          <View style={estilos.indisponivel}><Text style={estilos.rotulo}>Story indisponível</Text></View>
        ) : (
          <Image source={{ uri }} style={estilos.foto} onError={() => setIndisponivel(true)} accessibilityLabel="Story respondido" />
        )}
      </View>
    </View>
  )
}

const estilos = StyleSheet.create({
  caixa: { gap: 4, marginBottom: 4 },
  rotulo: { color: cores.textoApagado, fontSize: 12, textAlign: 'center' },
  linha: { gap: 8 },
  barra: { width: 3, borderRadius: 2, backgroundColor: cores.borda },
  foto: { width: 110, height: 195, borderRadius: raio.md, backgroundColor: cores.painelClaro },
  indisponivel: {
    width: 110, height: 70, borderRadius: raio.md, borderWidth: 1, borderStyle: 'dashed', borderColor: cores.borda,
    alignItems: 'center', justifyContent: 'center', padding: 6,
  },
})

export default RespostaDeStory
