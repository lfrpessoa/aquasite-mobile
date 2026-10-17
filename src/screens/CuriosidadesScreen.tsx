import React, { useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import Folha from '../components/Folha'
import Icone from '../components/Icone'
import type { NomeIcone } from '../components/Icone'
import IconeAnimal from '../components/IconeAnimal'
import { AMEACAS, DICAS, ECOSSISTEMAS, NUMEROS, POR_QUE_PRESERVAR, QUIZ } from '../data/conteudo'
import type { Dica } from '../data/conteudo'
import { ANIMAIS, GRUPOS } from '../data/animais'
import type { RaizParams } from '../types/navegacao'
import { base, cores, espaco, raio } from '../theme/tema'

type Props = NativeStackScreenProps<RaizParams, 'Curiosidades'>

/** Cartão com ícone, título e texto (ameaças e ecossistemas). */
const CartaoInfo = ({ item }: { item: { titulo: string; icone: NomeIcone; texto: string } }) => (
  <View style={estilos.info}>
    <View style={estilos.infoIcone}><Icone nome={item.icone} tamanho={20} cor={cores.destaque} /></View>
    <View style={{ flex: 1, gap: 4 }}>
      <Text style={estilos.porqueTitulo}>{item.titulo}</Text>
      <Text style={estilos.porqueTexto}>{item.texto}</Text>
    </View>
  </View>
)

/**
 * Curiosidades: os mesmos blocos da página do site (por que preservar, o oceano em números, ameaças,
 * ecossistemas, dicas e quiz) e, só no app, o atalho para o catálogo de animais marinhos.
 */
const CuriosidadesScreen = ({ navigation }: Props) => {
  const [dica, setDica] = useState<Dica | null>(null)
  const [respostas, setRespostas] = useState<Record<number, number>>({}) // pergunta -> opção escolhida
  const respondidas = Object.keys(respostas).length
  const acertos = QUIZ.filter((q, i) => respostas[i] === q.certa).length
  return (
    <ScrollView style={base.tela} contentContainerStyle={estilos.conteudo}>
      <View style={estilos.capa}>
        <Text style={estilos.titulo} accessibilityRole="header">Preserve a vida marinha</Text>
        <Text style={estilos.subtitulo}>Nossos oceanos abrigam uma vida incrível. Pequenas atitudes podem gerar grandes mudanças.</Text>
      </View>

      <Pressable style={({ pressed }) => [estilos.animais, pressed && { opacity: 0.8 }]} onPress={() => navigation.navigate('Animais')}
        accessibilityRole="button" accessibilityLabel={`Animais marinhos: ${ANIMAIS.length} espécies. Abrir catálogo`}>
        <View style={estilos.animaisIcones}>
          <IconeAnimal nome="tartaruga" tamanho={26} />
          <IconeAnimal nome="golfinho" tamanho={26} />
          <IconeAnimal nome="polvo" tamanho={26} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={estilos.dicaTitulo}>Animais marinhos</Text>
          <Text style={base.textoSuave}>{ANIMAIS.length} espécies em {GRUPOS.length} grupos, com curiosidades de cada uma</Text>
        </View>
        <Icone nome="arrow-right" tamanho={18} cor={cores.destaque} />
      </Pressable>

      <Text style={base.tituloSecao}>Por que preservar?</Text>
      <View style={estilos.grade}>
        {POR_QUE_PRESERVAR.map(item => (
          <View key={item.titulo} style={estilos.porque}>
            <Text style={estilos.porqueTitulo}>{item.titulo}</Text>
            <Text style={estilos.porqueTexto}>{item.texto}</Text>
          </View>
        ))}
      </View>

      <Text style={[base.tituloSecao, { marginTop: espaco.md }]}>O oceano em números</Text>
      <View style={estilos.grade}>
        {NUMEROS.map(n => (
          <View key={n.valor} style={estilos.numero} accessible accessibilityLabel={`${n.valor} ${n.texto}`}>
            <Text style={estilos.numeroValor}>{n.valor}</Text>
            <Text style={estilos.porqueTexto}>{n.texto}</Text>
          </View>
        ))}
      </View>

      <Text style={[base.tituloSecao, { marginTop: espaco.md }]}>O que ameaça os oceanos</Text>
      {AMEACAS.map(a => <CartaoInfo key={a.titulo} item={a} />)}

      <Text style={[base.tituloSecao, { marginTop: espaco.md }]}>Ecossistemas do litoral brasileiro</Text>
      {ECOSSISTEMAS.map(e => <CartaoInfo key={e.titulo} item={e} />)}

      <Text style={[base.tituloSecao, { marginTop: espaco.md }]}>O oceano precisa de você</Text>
      {DICAS.map(d => (
        <Pressable key={d.titulo} style={({ pressed }) => [estilos.dica, pressed && { opacity: 0.75 }]} onPress={() => setDica(d)}
          accessibilityRole="button" accessibilityLabel={`${d.titulo}. ${d.texto}. Toque para saber mais`}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={estilos.dicaTitulo}>{d.titulo}</Text>
            <Text style={base.textoSuave}>{d.texto}</Text>
          </View>
          <Icone nome="chevron-down" tamanho={18} cor={cores.destaque} />
        </Pressable>
      ))}

      <Text style={[base.tituloSecao, { marginTop: espaco.md }]}>Teste seus conhecimentos</Text>
      {QUIZ.map((q, i) => {
        const escolhida = respostas[i]
        const respondeu = escolhida !== undefined
        return (
          <View key={q.pergunta} style={estilos.pergunta}>
            <Text style={estilos.dicaTitulo}>{i + 1}. {q.pergunta}</Text>
            <View style={estilos.opcoes}>
              {q.opcoes.map((op, j) => {
                const certa = respondeu && j === q.certa
                const errada = respondeu && j === escolhida && j !== q.certa
                return (
                  <Pressable key={op} disabled={respondeu} onPress={() => setRespostas(r => ({ ...r, [i]: j }))}
                    style={[estilos.opcao, certa && estilos.opcaoCerta, errada && estilos.opcaoErrada, respondeu && !certa && !errada && { opacity: 0.5 }]}
                    accessibilityRole="button" accessibilityLabel={op}
                    accessibilityState={{ disabled: respondeu, selected: j === escolhida }}>
                    <Text style={estilos.opcaoTexto}>{op}</Text>
                  </Pressable>
                )
              })}
            </View>
            {respondeu && (
              <Text style={estilos.porqueTexto} accessibilityLiveRegion="polite">
                <Text style={estilos.porqueTitulo}>{escolhida === q.certa ? 'Acertou! ' : 'Quase! '}</Text>{q.explicacao}
              </Text>
            )}
          </View>
        )
      })}
      {respondidas === QUIZ.length && (
        <View style={estilos.resultado}>
          <Text style={[base.texto, { textAlign: 'center' }]}>
            Você acertou <Text style={{ fontWeight: '800' }}>{acertos} de {QUIZ.length}</Text>.{acertos === QUIZ.length ? ' Mandou muito bem!' : ' Que tal tentar de novo?'}
          </Text>
          <Pressable style={({ pressed }) => [estilos.botao, pressed && { opacity: 0.8 }]} onPress={() => setRespostas({})} accessibilityRole="button">
            <Text style={estilos.botaoTexto}>Responder de novo</Text>
          </Pressable>
        </View>
      )}

      <Folha visivel={dica !== null} titulo={dica?.titulo ?? ''} aoFechar={() => setDica(null)}>
        <Text style={base.tituloSecao}>Por que fazer?</Text>
        <Text style={base.texto}>{dica?.porQue}</Text>
        <Text style={[base.tituloSecao, { marginTop: espaco.md }]}>Como ajudar?</Text>
        <Text style={base.texto}>{dica?.comoAjudar}</Text>
      </Folha>
    </ScrollView>
  )
}

const estilos = StyleSheet.create({
  animaisIcones: { flexDirection: 'row', gap: 2 },
  conteudo: { padding: espaco.lg, gap: espaco.md, paddingBottom: espaco.xxl },
  capa: { backgroundColor: cores.fundo3, borderRadius: raio.lg + 4, padding: espaco.xl, gap: espaco.sm },
  titulo: { color: cores.destaque, fontSize: 28, fontWeight: '800' },
  subtitulo: { color: cores.textoSuave, fontSize: 15, lineHeight: 22 },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.sm },
  porque: {
    width: '48%', flexGrow: 1, backgroundColor: cores.painel, borderRadius: raio.lg, borderWidth: 1,
    borderColor: cores.borda, padding: espaco.md, gap: 4,
  },
  porqueTitulo: { color: cores.destaque, fontWeight: '700', fontSize: 15 },
  porqueTexto: { color: cores.textoSuave, fontSize: 13, lineHeight: 19 },
  dica: {
    flexDirection: 'row', alignItems: 'center', gap: espaco.md, backgroundColor: cores.painel, borderRadius: raio.lg,
    borderWidth: 1, borderColor: cores.borda, padding: espaco.lg,
  },
  dicaTitulo: { color: cores.texto, fontWeight: '700', fontSize: 16 },
  animais: {
    flexDirection: 'row', alignItems: 'center', gap: espaco.md, padding: espaco.lg, borderRadius: raio.lg,
    backgroundColor: cores.destaqueFundo, borderWidth: 1, borderColor: 'rgba(0,212,255,0.35)',
  },
  numero: {
    width: '48%', flexGrow: 1, alignItems: 'center', backgroundColor: cores.destaqueFundo, borderRadius: raio.lg,
    borderWidth: 1, borderColor: cores.borda, padding: espaco.md, gap: 4,
  },
  numeroValor: { color: cores.destaque, fontSize: 24, fontWeight: '800' },
  info: {
    flexDirection: 'row', gap: espaco.md, backgroundColor: cores.painel, borderRadius: raio.lg, borderWidth: 1,
    borderColor: cores.borda, padding: espaco.md,
  },
  infoIcone: {
    width: 38, height: 38, borderRadius: raio.md, alignItems: 'center', justifyContent: 'center', backgroundColor: cores.destaqueFundo,
  },
  pergunta: {
    backgroundColor: cores.painel, borderRadius: raio.lg, borderWidth: 1, borderColor: cores.borda, padding: espaco.md, gap: espaco.sm,
  },
  opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.sm },
  opcao: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: raio.md, borderWidth: 1, borderColor: cores.borda },
  opcaoCerta: { borderColor: cores.ok, backgroundColor: cores.destaqueFundo },
  opcaoErrada: { borderColor: cores.erro, backgroundColor: cores.erroFundo },
  opcaoTexto: { color: cores.texto, fontSize: 14 },
  resultado: { alignItems: 'center', gap: espaco.sm },
  botao: { backgroundColor: cores.destaque, borderRadius: 999, paddingVertical: 12, paddingHorizontal: 24 },
  botaoTexto: { color: cores.fundo, fontWeight: '700' },
})

export default CuriosidadesScreen
