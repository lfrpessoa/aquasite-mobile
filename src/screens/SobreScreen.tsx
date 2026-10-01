import React from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import Avatar from '../components/Avatar'
import { DICAS, EQUIPE } from '../data/conteudo'
import { PRAIAS } from '../utils/praias'
import { ANIMAIS } from '../data/animais'
import { base, cores, espaco, raio } from '../theme/tema'

/** Sobre o AquaSite: proposta, equipe e números (como a página Sobre do site). */
const SobreScreen = () => (
  <ScrollView style={base.tela} contentContainerStyle={estilos.conteudo}>
    <View style={estilos.capa}>
      <Text style={estilos.titulo} accessibilityRole="header">AquaSite</Text>
      <Text style={estilos.subtitulo}>
        Rede social educativa sobre vida marinha, alinhada ao ODS 14 da ONU — Vida na Água: conservar e usar de forma
        sustentável os oceanos, os mares e os recursos marinhos.
      </Text>
      <Text style={base.textoSuave}>TCC · Curso Técnico em Informática · FIEB Barueri · 2026</Text>
    </View>

    <Text style={base.tituloSecao}>Nossa equipe</Text>
    {EQUIPE.map(m => (
      <View key={m.nome} style={estilos.pessoa}>
        <Avatar username={m.nome} tamanho={46} />
        <View style={{ flex: 1 }}>
          <Text style={estilos.nome}>{m.nome}</Text>
          <Text style={estilos.papel}>{m.papel}</Text>
          <Text style={base.textoSuave}>{m.descricao}</Text>
        </View>
      </View>
    ))}

    <Text style={[base.tituloSecao, { marginTop: espaco.md }]}>Nosso impacto</Text>
    <View style={estilos.numeros}>
      {[[String(ANIMAIS.length), 'Animais no catálogo'], [String(PRAIAS.length), 'Praias em destaque'], [String(DICAS.length), 'Dicas de conservação']].map(([n, r]) => (
        <View key={r} style={estilos.numero} accessible accessibilityLabel={`${n} ${r}`}>
          <Text style={estilos.valor}>{n}</Text>
          <Text style={estilos.rotulo}>{r}</Text>
        </View>
      ))}
    </View>
  </ScrollView>
)

const estilos = StyleSheet.create({
  conteudo: { padding: espaco.lg, gap: espaco.md, paddingBottom: espaco.xxl },
  capa: { backgroundColor: cores.fundo3, borderRadius: raio.lg + 4, padding: espaco.xl, gap: espaco.sm },
  titulo: { color: cores.destaque, fontSize: 32, fontWeight: '800' },
  subtitulo: { color: cores.textoSuave, fontSize: 15, lineHeight: 22 },
  pessoa: {
    flexDirection: 'row', gap: espaco.md, alignItems: 'center', backgroundColor: cores.painel, borderRadius: raio.lg,
    borderWidth: 1, borderColor: cores.borda, padding: espaco.md,
  },
  nome: { color: cores.texto, fontWeight: '700', fontSize: 16 },
  papel: { color: cores.destaque, fontSize: 13, fontWeight: '600', marginBottom: 2 },
  numeros: { flexDirection: 'row', gap: espaco.sm },
  numero: { flex: 1, alignItems: 'center', backgroundColor: cores.painel, borderRadius: raio.lg, padding: espaco.md, borderWidth: 1, borderColor: cores.borda },
  valor: { color: cores.destaque, fontSize: 28, fontWeight: '800' },
  rotulo: { color: cores.textoApagado, fontSize: 12, textAlign: 'center' },
})

export default SobreScreen
