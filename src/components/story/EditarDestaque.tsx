import React, { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'
import Folha from '../Folha'
import Botao from '../Botao'
import Campo from '../Campo'
import { Aviso } from '../Estados'
import { SeletorIcone } from './EscolherDestaque'
import { destaques as apiDestaques, storys as apiStorys } from '../../services/api'
import { mensagemDeErro } from '../../services/http'
import { perguntar } from '../../utils/perguntar'
import { corDoPostTexto, opcoesDoDestaque } from '../../utils/storys'
import type { ItemVisor } from '../../utils/storys'
import type { Destaque, Post, Story, TipoItemDestaque } from '../../types/api'
import { cores, raio } from '../../theme/tema'

interface Props {
  visivel: boolean
  /** null = criar um destaque novo */
  destaque: Destaque | null
  posts: Post[]
  aoFechar: () => void
  aoSalvar: () => void
}

const chave = (i: { tipo: string; id: number }) => `${i.tipo}-${i.id}`

/** Criar ou editar um destaque: nome, ícone e quais storys e posts meus entram (na ordem em que forem marcados). */
const EditarDestaque = ({ visivel, destaque, posts, aoFechar, aoSalvar }: Props) => {
  // a janela é montada já aberta, com os dados do destaque (quem usa só a renderiza quando precisa)
  const [nome, setNome] = useState(destaque?.nome ?? '')
  const [icone, setIcone] = useState(destaque?.icone ?? 'onda')
  const [escolhidos, setEscolhidos] = useState<{ tipo: TipoItemDestaque; id: number }[]>(() => (destaque?.itens ?? []).map(i => ({ tipo: i.tipo, id: i.id })))
  const [noAr, setNoAr] = useState<Story[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    apiStorys.meus().then(setNoAr).catch(() => setNoAr([]))
  }, [])

  const opcoes = opcoesDoDestaque(noAr, destaque?.itens ?? [], posts)

  const alternar = (i: ItemVisor) => setEscolhidos(xs =>
    xs.some(x => chave(x) === chave(i)) ? xs.filter(x => chave(x) !== chave(i)) : [...xs, { tipo: i.tipo, id: i.id }])

  const salvar = async () => {
    if (!nome.trim()) { setErro('Dê um nome ao destaque.'); return }
    if (escolhidos.length === 0) { setErro('Escolha pelo menos um story ou post.'); return }
    setEnviando(true)
    setErro(null)
    try {
      const dados = { nome: nome.trim(), icone, itens: escolhidos }
      if (destaque) await apiDestaques.editar(destaque.id, dados)
      else await apiDestaques.criar(dados)
      aoSalvar()
      aoFechar()
    } catch (e) { setErro(mensagemDeErro(e)) }
    setEnviando(false)
  }

  const apagar = () => destaque && perguntar('Apagar destaque', `Apagar o destaque “${destaque.nome}”? Os posts continuam no perfil.`, [
    { text: 'Cancelar', style: 'cancel' },
    {
      text: 'Apagar', style: 'destructive', onPress: () => {
        apiDestaques.apagar(destaque.id).then(() => { aoSalvar(); aoFechar() }).catch(e => setErro(mensagemDeErro(e)))
      },
    },
  ])

  return (
    <Folha visivel={visivel} titulo={destaque ? 'Editar destaque' : 'Novo destaque'} aoFechar={aoFechar}>
      <Campo rotulo="Nome" value={nome} onChangeText={setNome} maxLength={30} placeholder="Ex.: Praias, Mutirões…" />
      <SeletorIcone valor={icone} aoMudar={setIcone} />
      <Text style={estilos.rotulo}>Escolha os seus storys e posts</Text>
      {opcoes.length === 0 && <Text style={estilos.suave}>Publique um story ou um post para poder guardá-lo num destaque.</Text>}
      <View style={estilos.grade}>
        {opcoes.map(i => {
          const n = escolhidos.findIndex(x => chave(x) === chave(i))
          const [a] = corDoPostTexto(i.id)
          return (
            <Pressable key={chave(i)} style={[estilos.opcao, n >= 0 && estilos.opcaoSel]} onPress={() => alternar(i)}
              accessibilityRole="checkbox" accessibilityState={{ checked: n >= 0 }}
              accessibilityLabel={`${i.tipo === 'story' ? 'Story' : 'Post'}${i.texto ? `: ${i.texto.slice(0, 40)}` : ''}`}>
              {i.imagem
                ? <Image source={{ uri: i.imagem }} style={StyleSheet.absoluteFill} contentFit="cover" />
                : <View style={[StyleSheet.absoluteFill, estilos.texto, { backgroundColor: a }]}><Text style={estilos.textoPost} numberOfLines={4}>{i.texto}</Text></View>}
              <Text style={estilos.tipo}>{i.tipo}</Text>
              {n >= 0 && <View style={estilos.ordem}><Text style={estilos.ordemTexto}>{n + 1}</Text></View>}
            </Pressable>
          )
        })}
      </View>
      <Aviso tipo="erro" texto={erro} />
      <Botao titulo="Salvar destaque" onPress={() => void salvar()} carregando={enviando} />
      {destaque && <Botao titulo="Apagar destaque" icone="trash" variante="perigo" onPress={apagar} />}
    </Folha>
  )
}

const estilos = StyleSheet.create({
  rotulo: { color: cores.destaque, fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  suave: { color: cores.textoApagado, fontSize: 13 },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  opcao: { width: '24%', aspectRatio: 1, borderRadius: raio.sm, overflow: 'hidden', backgroundColor: cores.painelClaro },
  opcaoSel: { borderWidth: 3, borderColor: cores.destaque },
  texto: { alignItems: 'center', justifyContent: 'center', padding: 4 },
  textoPost: { color: '#fff', fontSize: 9, fontWeight: '700', textAlign: 'center' },
  tipo: { position: 'absolute', left: 4, top: 4, color: '#fff', fontSize: 9, fontWeight: '700', backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 999, paddingHorizontal: 5, overflow: 'hidden' },
  ordem: { position: 'absolute', right: 4, bottom: 4, width: 20, height: 20, borderRadius: 10, backgroundColor: cores.destaque, alignItems: 'center', justifyContent: 'center' },
  ordemTexto: { color: '#002033', fontSize: 11, fontWeight: '800' },
})

export default EditarDestaque
