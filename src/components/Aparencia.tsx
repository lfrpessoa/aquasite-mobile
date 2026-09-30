import React, { useState } from 'react'
import { StyleSheet, Switch, Text, View } from 'react-native'
import Folha from './Folha'
import Chips from './Chips'
import Botao from './Botao'
import { Aviso } from './Estados'
import { preferencias } from '../theme/cores'
import type { Preferencias, Tema } from '../theme/cores'
import { salvarPreferencias } from '../theme/preferencias'
import { mensagemDeErro } from '../services/http'
import { base, cores, espaco } from '../theme/tema'

/**
 * Aparência e acessibilidade (como o modo acessível do site): tema claro ou escuro, alto contraste
 * e menos animações. O tamanho das letras segue o do celular (Configurações > Tela > Tamanho da fonte).
 */
const Aparencia = ({ visivel, aoFechar }: { visivel: boolean; aoFechar: () => void }) => {
  const [escolha, setEscolha] = useState<Preferencias>({ ...preferencias })
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const mudou = escolha.tema !== preferencias.tema || escolha.altoContraste !== preferencias.altoContraste
    || escolha.menosMovimento !== preferencias.menosMovimento

  const aplicar = async () => {
    setSalvando(true)
    try { await salvarPreferencias(escolha) } catch (e) { setErro(mensagemDeErro(e)); setSalvando(false) }
  }

  const Opcao = ({ rotulo, dica, valor, aoMudar }: { rotulo: string; dica: string; valor: boolean; aoMudar: (v: boolean) => void }) => (
    <View style={estilos.opcao}>
      <View style={{ flex: 1 }}>
        <Text style={base.texto}>{rotulo}</Text>
        <Text style={base.textoSuave}>{dica}</Text>
      </View>
      <Switch value={valor} onValueChange={aoMudar} accessibilityLabel={rotulo}
        trackColor={{ true: cores.destaque, false: cores.bordaForte }} thumbColor={cores.branco} />
    </View>
  )

  return (
    <Folha visivel={visivel} titulo="Aparência e acessibilidade" aoFechar={aoFechar}>
      <Text style={base.tituloSecao}>Tema</Text>
      <Chips<Tema> opcoes={[{ valor: 'escuro', label: 'Escuro' }, { valor: 'claro', label: 'Claro' }]}
        valor={escolha.tema} aoMudar={t => setEscolha(e => ({ ...e, tema: t }))} rolavel={false} rotulo="Tema" />
      <Opcao rotulo="Alto contraste" dica="Texto e bordas com cor cheia, para enxergar melhor."
        valor={escolha.altoContraste} aoMudar={v => setEscolha(e => ({ ...e, altoContraste: v }))} />
      <Opcao rotulo="Menos animações" dica="Telas e janelas abrem sem movimento."
        valor={escolha.menosMovimento} aoMudar={v => setEscolha(e => ({ ...e, menosMovimento: v }))} />
      <Text style={base.textoSuave}>
        Letras maiores: o app usa o tamanho de letra do celular. Aumente em Configurações do aparelho, em Tela ou Acessibilidade.
      </Text>
      <Aviso tipo="erro" texto={erro} />
      <Botao titulo={mudou ? 'Aplicar (o app reinicia)' : 'Nada mudou'} onPress={aplicar} carregando={salvando} desativado={!mudou} />
    </Folha>
  )
}

const estilos = StyleSheet.create({
  opcao: { flexDirection: 'row', alignItems: 'center', gap: espaco.md, paddingVertical: espaco.sm },
})

export default Aparencia
