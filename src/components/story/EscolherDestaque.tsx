import React, { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'
import Folha from '../Folha'
import Botao from '../Botao'
import Campo from '../Campo'
import Icone from '../Icone'
import { Aviso } from '../Estados'
import { destaques as apiDestaques } from '../../services/api'
import { mensagemDeErro } from '../../services/http'
import { ICONES_DESTAQUE, iconeDoDestaque } from '../../utils/storys'
import type { Destaque, TipoItemDestaque } from '../../types/api'
import { cores, espaco, raio } from '../../theme/tema'

interface Props {
  visivel: boolean
  username: string
  item: { tipo: TipoItemDestaque; id: number }
  aoFechar: () => void
  aoConcluir?: (mensagem: string) => void
}

/** "Adicionar ao destaque": guarda um story ou post meu num destaque que já existe ou num destaque novo. */
const EscolherDestaque = ({ visivel, username, item, aoFechar, aoConcluir }: Props) => {
  const [lista, setLista] = useState<Destaque[] | null>(null)
  const [novo, setNovo] = useState(false)
  const [nome, setNome] = useState('')
  const [icone, setIcone] = useState('onda')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  // a janela é montada já aberta (quem usa só a renderiza quando precisa)
  useEffect(() => {
    apiDestaques.doPerfil(username).then(setLista).catch(() => setLista([]))
  }, [username])

  const guardar = async (d: Destaque) => {
    setEnviando(true)
    try {
      await apiDestaques.adicionar(d.id, item.tipo, item.id)
      aoConcluir?.(`Guardado em “${d.nome}”.`)
      aoFechar()
    } catch (e) { setErro(mensagemDeErro(e)) }
    setEnviando(false)
  }

  const criar = async () => {
    if (!nome.trim()) { setErro('Dê um nome ao destaque.'); return }
    setEnviando(true)
    try {
      await apiDestaques.criar({ nome: nome.trim(), icone, itens: [item] })
      aoConcluir?.(`Destaque “${nome.trim()}” criado.`)
      aoFechar()
    } catch (e) { setErro(mensagemDeErro(e)) }
    setEnviando(false)
  }

  return (
    <Folha visivel={visivel} titulo="Adicionar ao destaque" aoFechar={aoFechar}>
      {lista === null && <Text style={estilos.suave}>Carregando…</Text>}
      {!novo && lista?.length === 0 && <Text style={estilos.suave}>Você ainda não tem destaques.</Text>}
      {!novo && lista?.map(d => (
        <Pressable key={d.id} style={estilos.linha} onPress={() => void guardar(d)} disabled={enviando} accessibilityRole="button"
          accessibilityLabel={`Guardar em ${d.nome}`}>
          <View style={estilos.mini}>
            {d.capa ? <Image source={{ uri: d.capa }} style={StyleSheet.absoluteFill} contentFit="cover" /> : <Icone nome={iconeDoDestaque(d.icone)} tamanho={20} cor="#3a2300" />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={estilos.nome}>{d.nome}</Text>
            <Text style={estilos.suave}>{d.itens.length} {d.itens.length === 1 ? 'item' : 'itens'}</Text>
          </View>
        </Pressable>
      ))}
      {novo ? (
        <>
          <Campo rotulo="Nome do destaque" value={nome} onChangeText={setNome} maxLength={30} placeholder="Ex.: Praias, Mutirões…" />
          <SeletorIcone valor={icone} aoMudar={setIcone} />
          <Botao titulo="Criar destaque" onPress={() => void criar()} carregando={enviando} />
          <Botao titulo="Voltar" variante="texto" onPress={() => setNovo(false)} />
        </>
      ) : (
        <Botao titulo="Novo destaque" icone="plus" variante="secundario" onPress={() => setNovo(true)} />
      )}
      <Aviso tipo="erro" texto={erro} />
    </Folha>
  )
}

/** Os ícones que a capa de um destaque pode ter. */
export const SeletorIcone = ({ valor, aoMudar }: { valor: string; aoMudar: (id: string) => void }) => (
  <View>
    <Text style={estilos.rotulo}>Ícone da capa</Text>
    <View style={estilos.icones}>
      {ICONES_DESTAQUE.map(i => (
        <Pressable key={i.id} onPress={() => aoMudar(i.id)} style={[estilos.icone, valor === i.id && estilos.iconeSel]}
          accessibilityRole="button" accessibilityState={{ selected: valor === i.id }} accessibilityLabel={i.nome}>
          <Icone nome={i.icone} tamanho={20} cor={valor === i.id ? cores.destaque : cores.textoSuave} />
        </Pressable>
      ))}
    </View>
  </View>
)

const estilos = StyleSheet.create({
  suave: { color: cores.textoApagado, fontSize: 13 },
  linha: { flexDirection: 'row', alignItems: 'center', gap: espaco.md, padding: espaco.sm, borderRadius: raio.md, borderWidth: 1, borderColor: cores.borda },
  mini: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', backgroundColor: '#f9c74f', alignItems: 'center', justifyContent: 'center' },
  nome: { color: cores.texto, fontWeight: '700' },
  rotulo: { color: cores.destaque, fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: espaco.sm },
  icones: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.sm },
  icone: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: cores.borda, alignItems: 'center', justifyContent: 'center' },
  iconeSel: { borderColor: cores.destaque, backgroundColor: cores.destaqueFundo },
})

export default EscolherDestaque
