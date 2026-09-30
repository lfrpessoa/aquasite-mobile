import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import MapaPraias from '../components/MapaPraias'
import CondicoesPraia from '../components/CondicoesPraia'
import Chips from '../components/Chips'
import Campo from '../components/Campo'
import Botao from '../components/Botao'
import Icone from '../components/Icone'
import { Aviso } from '../components/Estados'
import { useAuth } from '../contexts/AuthContext'
import { useLocalizacao } from '../hooks/useLocalizacao'
import { buscarCondicoes, buscarLugares, nomeDoPonto, rotaDeCarro } from '../services/clima'
import type { Condicoes, Rota } from '../services/clima'
import { praias as apiPraias } from '../services/api'
import { mensagemDeErro } from '../services/http'
import { CATEGORIAS, PRAIAS, categoriaInfo, praiaMaisProxima } from '../utils/praias'
import type { Local } from '../utils/praias'
import { duracao, tempoAtras } from '../utils/formatar'
import type { AvisoPraia, CategoriaAviso } from '../types/api'
import { base, cores, espaco, raio } from '../theme/tema'

/**
 * Página Mapa (a mesma do site): praias em destaque, busca por nome, toque em qualquer ponto do litoral,
 * distância de carro, tempo, mar, maré, previsão, alertas e avisos da comunidade (GET/POST /api/beach-reports).
 */
const MapaScreen = () => {
  const { usuario } = useAuth()
  const loc = useLocalizacao()
  const eu = loc.estado === 'ok' ? { lat: loc.lat, lon: loc.lon } : null
  const [sel, setSel] = useState<Local | null>(null)
  const [dados, setDados] = useState<{ estado: 'carregando' } | { estado: 'erro' } | { estado: 'ok'; cond: Condicoes } | null>(null)
  const [rota, setRota] = useState<Rota | null | 'carregando'>(null)
  const [avisos, setAvisos] = useState<AvisoPraia[]>([])
  const [busca, setBusca] = useState('')
  const [resultados, setResultados] = useState<(Local & { praia: boolean })[] | null>(null)
  const [buscando, setBuscando] = useState(false)
  const pedido = useRef(0)
  const abriuPerto = useRef(false)

  // com a localização, abre sozinho a praia mais próxima (como o site)
  useEffect(() => {
    if (eu && !abriuPerto.current && !sel) {
      abriuPerto.current = true
      void selecionar(praiaMaisProxima(eu.lat, eu.lon).praia)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eu?.lat, eu?.lon])

  const carregarAvisos = (nome: string) => {
    apiPraias.avisos(nome).then(l => setAvisos(Array.isArray(l) ? l : [])).catch(() => setAvisos([]))
  }

  const selecionar = async (p: Local) => {
    const id = ++pedido.current
    setSel(p)
    setResultados(null)
    setDados({ estado: 'carregando' })
    setAvisos([])
    setRota(null)
    if (p.nome !== 'Ponto no mapa') carregarAvisos(p.nome)
    if (eu) {
      setRota('carregando')
      rotaDeCarro(eu, p).then(r => { if (id === pedido.current) setRota(r) }).catch(() => { if (id === pedido.current) setRota(null) })
    }
    try {
      const cond = await buscarCondicoes(p.lat, p.lon)
      if (id === pedido.current) setDados({ estado: 'ok', cond })
    } catch {
      if (id === pedido.current) setDados({ estado: 'erro' })
    }
  }

  const tocarPonto = async (lat: number, lon: number) => {
    const provisorio: Local = { nome: 'Ponto no mapa', cidade: '', uf: '', lat, lon }
    void selecionar(provisorio)
    try {
      const l = await nomeDoPonto(lat, lon)
      setSel(atual => (atual && atual.lat === lat && atual.lon === lon ? l : atual))
      carregarAvisos(l.nome)
    } catch { /* sem nome: segue como "Ponto no mapa" */ }
  }

  const pesquisar = async () => {
    const termo = busca.trim()
    if (termo.length < 2) return
    setBuscando(true)
    try { setResultados(await buscarLugares(termo)) } catch { setResultados([]) }
    setBuscando(false)
  }

  const locais = busca.trim().length >= 2
    ? PRAIAS.filter(p => `${p.nome} ${p.cidade} ${p.uf}`.toLowerCase().includes(busca.trim().toLowerCase()))
    : []

  return (
    <SafeAreaView style={base.tela} edges={['top']}>
      <View style={estilos.mapa}>
        <MapaPraias praias={PRAIAS} selecionada={sel} eu={eu} aoTocarPraia={p => void selecionar(p)} aoTocarPonto={(a, b) => void tocarPonto(a, b)} />
      </View>
      <ScrollView style={estilos.painel} contentContainerStyle={estilos.painelConteudo} keyboardShouldPersistTaps="handled">
        <View style={estilos.busca}>
          <Icone nome="search" tamanho={16} cor={cores.textoApagado} />
          <TextInput value={busca} onChangeText={t => { setBusca(t); setResultados(null) }} onSubmitEditing={pesquisar}
            returnKeyType="search" placeholder="Pesquise praias do Brasil" placeholderTextColor={cores.textoApagado}
            style={estilos.buscaInput} accessibilityLabel="Pesquisar praias do Brasil" />
          {buscando && <ActivityIndicator color={cores.destaque} />}
        </View>
        {(locais.length > 0 || resultados) && (
          <View style={estilos.sugestoes}>
            {locais.map(p => (
              <Pressable key={`l-${p.nome}`} style={estilos.sugestao} onPress={() => { setBusca(''); void selecionar(p) }} accessibilityRole="button">
                <Icone nome="waves" tamanho={14} cor={cores.destaque} /><Text style={estilos.sugestaoTexto}><Text style={{ fontWeight: '700' }}>{p.nome}</Text> {p.cidade} - {p.uf}</Text>
              </Pressable>
            ))}
            {resultados?.map((p, i) => (
              <Pressable key={`r-${i}`} style={estilos.sugestao} onPress={() => { setBusca(''); void selecionar(p) }} accessibilityRole="button">
                <Icone nome={p.praia ? 'waves' : 'map-pin'} tamanho={14} cor={cores.destaque} />
                <Text style={estilos.sugestaoTexto}><Text style={{ fontWeight: '700' }}>{p.nome}</Text> {[p.cidade, p.uf].filter(Boolean).join(' - ')}</Text>
              </Pressable>
            ))}
            {resultados?.length === 0 && <Text style={base.textoSuave}>Nada encontrado.</Text>}
            {!resultados && <Text style={base.textoSuave}>Toque em "buscar" no teclado para procurar em todo o Brasil</Text>}
          </View>
        )}

        {!sel ? (
          <View style={{ gap: espaco.md }}>
            <Text style={estilos.titulo}>Veja qualquer praia, de onde você estiver</Text>
            <Text style={base.textoSuave}>Escolha uma praia no mapa, busque pelo nome ou toque em qualquer ponto da costa para ver o tempo, as ondas, a maré e a temperatura da água agora.</Text>
            {loc.estado === 'negado' && <Aviso tipo="atencao" texto="Sem acesso à sua localização: a distância até a praia não será mostrada." />}
            <Text style={base.tituloSecao}>Praias em destaque</Text>
            <Chips opcoes={PRAIAS.map(p => ({ valor: p.nome, label: `${p.nome} · ${p.uf}` }))} valor="" rolavel={false}
              aoMudar={nome => { const p = PRAIAS.find(x => x.nome === nome); if (p) void selecionar(p) }} rotulo="Praias em destaque" />
          </View>
        ) : (
          <View style={{ gap: espaco.md }}>
            <View>
              <Text style={estilos.titulo} accessibilityRole="header">{sel.nome}</Text>
              <Text style={base.textoSuave}>
                {[sel.cidade, sel.uf].filter(Boolean).join(' - ') || `${sel.lat.toFixed(3)}, ${sel.lon.toFixed(3)}`}
                {rota === 'carregando' && ' · calculando rota...'}
                {rota && rota !== 'carregando' && ` · ${rota.km < 1 ? 'menos de 1' : Math.round(rota.km)} km de carro (${duracao(rota.min)})`}
              </Text>
              <View style={estilos.acoes}>
                <Botao titulo="Como chegar" icone="navigation" pequeno
                  onPress={() => void Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${sel.lat},${sel.lon}`)} />
                <Botao titulo="Outras praias" pequeno variante="texto" onPress={() => setSel(null)} />
              </View>
            </View>
            {dados?.estado === 'carregando' && <ActivityIndicator color={cores.destaque} style={{ margin: 20 }} />}
            {dados?.estado === 'erro' && <Aviso tipo="erro" texto="Não foi possível carregar as condições agora. Tente de novo em instantes." />}
            {dados?.estado === 'ok' && <CondicoesPraia dados={dados.cond} />}
            <AvisosComunidade praia={sel} avisos={avisos} logado={!!usuario} aoEnviar={() => carregarAvisos(sel.nome)} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

/** "O que está acontecendo lá": avisos que a comunidade manda sobre a praia. */
const AvisosComunidade = ({ praia, avisos, logado, aoEnviar }: { praia: Local; avisos: AvisoPraia[]; logado: boolean; aoEnviar: () => void }) => {
  const [categoria, setCategoria] = useState<CategoriaAviso>('poluicao')
  const [descricao, setDescricao] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const enviar = async () => {
    if (!descricao.trim()) { setErro('Descreva o que está acontecendo.'); return }
    setEnviando(true)
    setErro(null)
    try {
      const r = await apiPraias.avisar({ praia: praia.nome, uf: praia.uf, categoria, descricao: descricao.trim() })
      if (r.success) { setDescricao(''); aoEnviar() } else setErro(r.error ?? 'Não foi possível enviar.')
    } catch (e) { setErro(mensagemDeErro(e)) }
    setEnviando(false)
  }

  return (
    <View style={base.cartao}>
      <Text style={base.tituloSecao}>O que está acontecendo lá</Text>
      {avisos.length === 0 && <Text style={base.textoSuave}>Nenhum aviso recente da comunidade.</Text>}
      {avisos.map(a => {
        const cat = categoriaInfo(a.categoria)
        return (
          <View key={a.id} style={estilos.aviso}>
            <View style={estilos.avisoTopo}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Icone nome={cat.icone} tamanho={14} cor={cat.cor} /><Text style={{ color: cat.cor, fontWeight: '700', fontSize: 13 }}>{cat.label}</Text>
              </View>
              <Text style={base.textoSuave}>{tempoAtras(a.created_at)}</Text>
            </View>
            <Text style={base.texto}>{a.descricao}</Text>
            <Text style={base.textoSuave}>@{a.usuario}</Text>
          </View>
        )
      })}
      {logado ? (
        <View style={{ gap: espaco.sm, marginTop: espaco.md }}>
          <Chips opcoes={CATEGORIAS.map(c => ({ valor: c.valor, label: c.label }))} valor={categoria} aoMudar={setCategoria} rotulo="Categoria do aviso" />
          <Campo value={descricao} onChangeText={setDescricao} placeholder="O que você está vendo na praia agora?" multiline maxLength={500} />
          <Aviso tipo="erro" texto={erro} />
          <Botao titulo="Avisar a comunidade" icone="alert" onPress={enviar} carregando={enviando} />
        </View>
      ) : (
        <Text style={[base.textoSuave, { marginTop: espaco.sm }]}>Entre na sua conta para avisar a comunidade.</Text>
      )}
    </View>
  )
}

const estilos = StyleSheet.create({
  mapa: { height: '40%', backgroundColor: cores.fundo3 },
  painel: { flex: 1, borderTopLeftRadius: raio.lg, borderTopRightRadius: raio.lg, marginTop: -raio.lg, backgroundColor: cores.fundo },
  painelConteudo: { padding: espaco.lg, gap: espaco.md, paddingBottom: espaco.xxl },
  busca: {
    flexDirection: 'row', alignItems: 'center', gap: espaco.sm, paddingHorizontal: espaco.md, borderRadius: raio.pilula,
    borderWidth: 1, borderColor: cores.bordaForte, backgroundColor: 'rgba(255,255,255,0.05)',
  },
  buscaInput: { flex: 1, color: cores.texto, minHeight: 44, fontSize: 15 },
  sugestoes: { gap: 2, backgroundColor: cores.painel, borderRadius: raio.md, padding: espaco.sm, borderWidth: 1, borderColor: cores.borda },
  sugestao: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 6 },
  sugestaoTexto: { color: cores.texto, fontSize: 14, flex: 1 },
  titulo: { color: cores.texto, fontSize: 22, fontWeight: '800' },
  acoes: { flexDirection: 'row', gap: espaco.sm, marginTop: espaco.sm },
  aviso: { borderTopWidth: 1, borderTopColor: cores.borda, paddingVertical: espaco.sm, gap: 3 },
  avisoTopo: { flexDirection: 'row', justifyContent: 'space-between' },
})

export default MapaScreen
