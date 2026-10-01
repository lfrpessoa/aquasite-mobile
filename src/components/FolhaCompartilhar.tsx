import React, { useEffect, useState } from 'react'
import { Pressable, Share, StyleSheet, Text, TextInput, View } from 'react-native'
import * as Clipboard from 'expo-clipboard'
import Folha from './Folha'
import Avatar from './Avatar'
import Botao from './Botao'
import Icone from './Icone'
import { Aviso } from './Estados'
import { useAuth } from '../contexts/AuthContext'
import { busca, contas, mensagens } from '../services/api'
import { linkCompleto, textoDaMensagem } from '../utils/compartilhar'
import type { AlvoCompartilhar } from '../utils/compartilhar'
import { base, cores, espaco, raio } from '../theme/tema'

interface Pessoa { username: string; avatar: string | null }

interface Props {
  /** o que está sendo compartilhado (a folha só é montada enquanto está aberta) */
  alvo: AlvoCompartilhar
  aoFechar: () => void
}

/**
 * "Compartilhar" (igual à janela do site): copia o link, abre o compartilhar do celular
 * (WhatsApp, e-mail...) ou envia por mensagem para pessoas do AquaSite.
 */
const FolhaCompartilhar = ({ alvo, aoFechar }: Props) => {
  const { usuario } = useAuth()
  const eu = usuario?.username ?? null
  const [pessoas, setPessoas] = useState<Pessoa[]>([])
  const [carregando, setCarregando] = useState(false)
  const [termo, setTermo] = useState('')
  const [encontradas, setEncontradas] = useState<Pessoa[] | null>(null)
  const [escolhidos, setEscolhidos] = useState<Pessoa[]>([])
  const [recado, setRecado] = useState('')
  const [copiado, setCopiado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)

  // ao abrir: carrega conversas recentes + quem a pessoa segue
  useEffect(() => {
    if (!eu) return
    let ativo = true
    setCarregando(true)
    void Promise.allSettled([mensagens.conversas(eu), contas.seguindo(eu)]).then(([c, s]) => {
      if (!ativo) return
      const lista: Pessoa[] = []
      const ja = new Set([eu])
      const juntar = (username: string, avatar: string | null) => {
        if (!username || ja.has(username)) return
        ja.add(username)
        lista.push({ username, avatar })
      }
      if (c.status === 'fulfilled') c.value.forEach(x => juntar(x.other_user, x.avatar))
      if (s.status === 'fulfilled') s.value.forEach(x => juntar(x.username, x.avatar))
      setPessoas(lista)
      setCarregando(false)
    })
    return () => { ativo = false }
  }, [eu])

  // busca enquanto digita (espera a pessoa parar de digitar)
  useEffect(() => {
    const t = termo.trim()
    if (!t) { setEncontradas(null); return }
    const espera = setTimeout(() => {
      busca.pesquisar(t)
        .then(r => setEncontradas(r.users.filter(x => x.username !== eu).map(x => ({ username: x.username, avatar: x.avatar ?? null }))))
        .catch(() => setEncontradas([]))
    }, 300)
    return () => clearTimeout(espera)
  }, [termo, eu])

  const link = linkCompleto(alvo.caminho)

  const copiar = async () => {
    await Clipboard.setStringAsync(link)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2500)
  }

  const outroApp = async () => {
    try {
      await Share.share({ message: `${alvo.resumo}\n${link}`, url: link, title: 'AquaSite' })
    } catch { /* a pessoa fechou a janela */ }
  }

  const alternar = (p: Pessoa) => {
    setAviso(null)
    setEscolhidos(xs => (xs.some(x => x.username === p.username) ? xs.filter(x => x.username !== p.username) : [...xs, p]))
  }

  const enviar = async () => {
    if (escolhidos.length === 0) return
    setEnviando(true); setAviso(null)
    const texto = textoDaMensagem(alvo, recado)
    const r = await Promise.allSettled(escolhidos.map(p => mensagens.enviar(p.username, texto, null)))
    const ok = r.filter(x => x.status === 'fulfilled').length
    setEnviando(false)
    if (ok === escolhidos.length) {
      setAviso({ tipo: 'ok', texto: `Enviado para ${ok === 1 ? `@${escolhidos[0].username}` : `${ok} pessoas`}.` })
      setEscolhidos([]); setRecado('')
      setTimeout(aoFechar, 1200)
    } else {
      setAviso({ tipo: 'erro', texto: ok > 0 ? `Enviado para ${ok} de ${escolhidos.length}. Tente de novo para as outras.` : 'Não foi possível enviar. Tente de novo.' })
    }
  }

  // sem busca: quem já foi escolhido (mesmo achado pela busca) aparece primeiro, para dar para desmarcar
  const lista = encontradas ?? [...escolhidos.filter(e => !pessoas.some(p => p.username === e.username)), ...pessoas]

  return (
    <Folha visivel titulo="Compartilhar" aoFechar={aoFechar}>
      <Text style={estilos.resumo} numberOfLines={3}>{alvo.resumo}</Text>

      <View style={estilos.link}>
        <Icone nome="link" tamanho={16} cor={cores.textoApagado} />
        <Text style={estilos.linkTexto} numberOfLines={1} selectable>{link}</Text>
      </View>
      <View style={estilos.linha}>
        <Botao titulo={copiado ? 'Link copiado' : 'Copiar link'} icone={copiado ? 'check' : 'copy'} pequeno onPress={() => void copiar()} estilo={{ flex: 1 }} />
        <Botao titulo="Outro app" icone="share" pequeno variante="secundario" onPress={() => void outroApp()} estilo={{ flex: 1 }} />
      </View>

      <Text style={[base.tituloSecao, { marginTop: espaco.sm, marginBottom: 0 }]}>Enviar por mensagem</Text>
      {!eu ? (
        <Text style={base.textoSuave}>Entre na sua conta para enviar a outras pessoas do AquaSite.</Text>
      ) : (
        <>
          <View style={estilos.busca}>
            <Icone nome="search" tamanho={16} cor={cores.textoApagado} />
            <TextInput value={termo} onChangeText={setTermo} placeholder="Buscar pessoa..." placeholderTextColor={cores.textoApagado}
              style={estilos.buscaInput} autoCapitalize="none" autoCorrect={false} accessibilityLabel="Buscar pessoa" />
          </View>
          {carregando && !encontradas && <Text style={base.textoSuave}>Carregando...</Text>}
          {!carregando && lista.length === 0 && (
            <Text style={base.textoSuave}>{encontradas ? 'Ninguém encontrado.' : 'Busque alguém pelo nome de usuário.'}</Text>
          )}
          <View style={{ gap: 2 }}>
            {lista.slice(0, 30).map(p => {
              const marcado = escolhidos.some(e => e.username === p.username)
              return (
                <Pressable key={p.username} onPress={() => alternar(p)} style={[estilos.pessoa, marcado && estilos.pessoaMarcada]}
                  accessibilityRole="checkbox" accessibilityState={{ checked: marcado }} accessibilityLabel={`@${p.username}`}>
                  <Avatar username={p.username} url={p.avatar} tamanho={36} />
                  <Text style={estilos.nome} numberOfLines={1}>@{p.username}</Text>
                  <View style={[estilos.marca, marcado && estilos.marcaLigada]}>
                    {marcado && <Icone nome="check" tamanho={13} cor={cores.fundo} />}
                  </View>
                </Pressable>
              )
            })}
          </View>
          {escolhidos.length > 0 && (
            <TextInput value={recado} onChangeText={setRecado} placeholder="Escreva um recado (opcional)" maxLength={300}
              placeholderTextColor={cores.textoApagado} style={estilos.recado} accessibilityLabel="Recado" />
          )}
          <Aviso tipo={aviso?.tipo} texto={aviso?.texto} />
          <Botao titulo={escolhidos.length === 0 ? 'Escolha quem vai receber'
            : `Enviar para ${escolhidos.length === 1 ? `@${escolhidos[0].username}` : `${escolhidos.length} pessoas`}`}
            icone="arrow-right" onPress={() => void enviar()} carregando={enviando} desativado={escolhidos.length === 0} />
        </>
      )}
    </Folha>
  )
}

const estilos = StyleSheet.create({
  resumo: {
    color: cores.textoSuave, fontSize: 14, lineHeight: 20, paddingVertical: espaco.sm, paddingHorizontal: espaco.md,
    borderLeftWidth: 3, borderLeftColor: cores.destaque, backgroundColor: cores.destaqueFundo, borderRadius: raio.sm,
  },
  link: {
    flexDirection: 'row', alignItems: 'center', gap: espaco.sm, paddingHorizontal: espaco.md, minHeight: 42,
    borderRadius: raio.md, borderWidth: 1, borderColor: cores.borda, backgroundColor: 'rgba(255,255,255,0.04)',
  },
  linkTexto: { flex: 1, color: cores.texto, fontSize: 13 },
  linha: { flexDirection: 'row', gap: espaco.sm },
  busca: {
    flexDirection: 'row', alignItems: 'center', gap: espaco.sm, paddingHorizontal: espaco.md,
    borderRadius: raio.pilula, borderWidth: 1, borderColor: cores.bordaForte, backgroundColor: 'rgba(255,255,255,0.05)',
  },
  buscaInput: { flex: 1, minHeight: 42, color: cores.texto, fontSize: 15 },
  pessoa: {
    flexDirection: 'row', alignItems: 'center', gap: espaco.md, padding: espaco.sm, minHeight: 48,
    borderRadius: raio.md, borderWidth: 1, borderColor: 'transparent',
  },
  pessoaMarcada: { backgroundColor: cores.destaqueFundo, borderColor: cores.destaque },
  nome: { flex: 1, color: cores.texto, fontWeight: '600', fontSize: 15 },
  marca: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: cores.bordaForte,
    alignItems: 'center', justifyContent: 'center',
  },
  marcaLigada: { backgroundColor: cores.destaque, borderColor: cores.destaque },
  recado: {
    minHeight: 44, borderRadius: raio.md, borderWidth: 1, borderColor: cores.bordaForte, color: cores.texto,
    paddingHorizontal: espaco.md, backgroundColor: 'rgba(255,255,255,0.05)', fontSize: 15,
  },
})

export default FolhaCompartilhar
