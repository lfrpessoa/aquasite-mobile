import React from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import Icone from './Icone'
import type { NomeIcone } from './Icone'
import Botao from './Botao'
import { cores, espaco, raio } from '../theme/tema'

/** Indicador de carregamento centralizado. */
export const Carregando = ({ texto = 'Carregando...' }: { texto?: string }) => (
  <View style={estilos.centro} accessibilityLiveRegion="polite">
    <ActivityIndicator size="large" color={cores.destaque} />
    <Text style={estilos.suave}>{texto}</Text>
  </View>
)

/** Lista vazia ou erro, com botão opcional de tentar de novo. */
export const EstadoVazio = ({ icone = 'waves', texto, acao, aoAgir }: {
  icone?: NomeIcone; texto: string; acao?: string; aoAgir?: () => void
}) => (
  <View style={estilos.centro}>
    <Icone nome={icone} tamanho={40} cor={cores.textoApagado} />
    <Text style={[estilos.suave, { textAlign: 'center' }]}>{texto}</Text>
    {acao && aoAgir && <Botao titulo={acao} onPress={aoAgir} variante="secundario" pequeno />}
  </View>
)

type TipoAviso = 'erro' | 'ok' | 'atencao' | 'info'

const COR_AVISO: Record<TipoAviso, { fundo: string; borda: string; texto: string; icone: NomeIcone }> = {
  erro: { fundo: cores.erroFundo, borda: 'rgba(255,107,107,0.4)', texto: cores.erro, icone: 'alert' },
  ok: { fundo: 'rgba(78,205,196,0.12)', borda: 'rgba(78,205,196,0.4)', texto: cores.ok, icone: 'check' },
  atencao: { fundo: cores.atencaoFundo, borda: 'rgba(255,167,38,0.45)', texto: cores.texto, icone: 'alert' },
  info: { fundo: cores.destaqueFundo, borda: 'rgba(0,212,255,0.3)', texto: cores.texto, icone: 'waves' },
}

/** Caixa de mensagem (erro da API, confirmação, aviso). */
export const Aviso = ({ tipo = 'info', texto }: { tipo?: TipoAviso; texto: string | null | undefined }) => {
  if (!texto) return null
  const c = COR_AVISO[tipo]
  return (
    <View style={[estilos.aviso, { backgroundColor: c.fundo, borderColor: c.borda }]} accessibilityLiveRegion="polite" accessibilityRole="alert">
      <Icone nome={c.icone} tamanho={16} cor={tipo === 'atencao' ? cores.atencao : c.texto} />
      <Text style={[estilos.avisoTexto, { color: c.texto }]}>{texto}</Text>
    </View>
  )
}

const estilos = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: espaco.md, padding: espaco.xl, minHeight: 200 },
  suave: { color: cores.textoApagado, fontSize: 14 },
  aviso: {
    flexDirection: 'row', gap: espaco.sm, alignItems: 'flex-start', borderWidth: 1,
    borderRadius: raio.md, padding: espaco.md,
  },
  avisoTexto: { flex: 1, fontSize: 14, lineHeight: 20 },
})
