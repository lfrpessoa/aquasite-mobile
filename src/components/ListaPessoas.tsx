import React, { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Folha from './Folha'
import Avatar from './Avatar'
import Chips from './Chips'
import Botao from './Botao'
import { Aviso, Carregando } from './Estados'
import { contas } from '../services/api'
import { mensagemDeErro } from '../services/http'
import type { PessoaLista } from '../types/api'
import { cores, espaco } from '../theme/tema'

type Aba = 'seguidores' | 'seguindo'

interface Props {
  visivel: boolean
  username: string
  abaInicial: Aba
  eu: string | null
  aoFechar: () => void
  aoAbrirPerfil: (username: string) => void
}

/** Lista de seguidores / seguindo de um perfil, com botão de seguir (como no site). */
const ListaPessoas = ({ visivel, username, abaInicial, eu, aoFechar, aoAbrirPerfil }: Props) => {
  const [aba, setAba] = useState<Aba>(abaInicial)
  // quem abriu pediu outra aba (seguidores ou seguindo): ajusta durante a renderização, sem efeito extra
  const [abaPedida, setAbaPedida] = useState<Aba>(abaInicial)
  if (abaPedida !== abaInicial) {
    setAbaPedida(abaInicial)
    setAba(abaInicial)
  }

  // a lista guarda de qual perfil/aba ela é: ao trocar de aba, a antiga some na hora e mostra "carregando"
  const chave = `${username}|${aba}`
  const [lista, setLista] = useState<{ chave: string; pessoas: PessoaLista[] } | null>(null)
  const [falha, setFalha] = useState<{ chave: string; erro: string } | null>(null)
  const pessoas = lista?.chave === chave ? lista.pessoas : null
  const erro = falha?.chave === chave ? falha.erro : null
  const setPessoas = (mudar: (l: PessoaLista[] | null) => PessoaLista[] | null) =>
    setLista(atual => (atual ? { ...atual, pessoas: mudar(atual.pessoas) ?? [] } : atual))
  const setErro = (texto: string) => setFalha({ chave, erro: texto })

  useEffect(() => {
    if (!visivel) return
    let vivo = true
    const busca = aba === 'seguidores' ? contas.seguidores(username) : contas.seguindo(username)
    busca
      .then(p => { if (vivo) { setLista({ chave, pessoas: p }); setFalha(null) } })
      .catch(e => { if (vivo) setFalha({ chave, erro: mensagemDeErro(e) }) })
    return () => { vivo = false }
  }, [visivel, aba, username, chave])

  const alternarSeguir = async (p: PessoaLista) => {
    setPessoas(lista => lista?.map(x => x.username === p.username ? { ...x, euSigo: !x.euSigo } : x) ?? null)
    try {
      if (p.euSigo) await contas.deixarDeSeguir(p.username)
      else await contas.seguir(p.username)
    } catch (e) {
      setErro(mensagemDeErro(e))
      setPessoas(lista => lista?.map(x => x.username === p.username ? { ...x, euSigo: p.euSigo } : x) ?? null)
    }
  }

  return (
    <Folha visivel={visivel} titulo={`@${username}`} aoFechar={aoFechar}>
      <Chips<Aba> opcoes={[{ valor: 'seguidores', label: 'Seguidores' }, { valor: 'seguindo', label: 'Seguindo' }]}
        valor={aba} aoMudar={setAba} rotulo="Lista" />
      <Aviso tipo="erro" texto={erro} />
      {!pessoas && !erro && <Carregando />}
      {pessoas?.length === 0 && (
        <Text style={estilos.vazio}>{aba === 'seguidores' ? 'Ninguém segue este perfil ainda.' : 'Este perfil ainda não segue ninguém.'}</Text>
      )}
      {pessoas?.map(p => (
        <View key={p.username} style={estilos.linha}>
          <Pressable style={estilos.pessoa} onPress={() => { aoFechar(); aoAbrirPerfil(p.username) }}
            accessibilityRole="link" accessibilityLabel={`Perfil de @${p.username}`}>
            <Avatar username={p.username} url={p.avatar} online={p.online} tamanho={42} />
            <View style={{ flex: 1 }}>
              <Text style={estilos.nome}>@{p.username}</Text>
              {!!p.bio && <Text style={estilos.bio} numberOfLines={1}>{p.bio}</Text>}
            </View>
          </Pressable>
          {eu && eu !== p.username && (
            <Botao titulo={p.euSigo ? 'Seguindo' : 'Seguir'} pequeno variante={p.euSigo ? 'secundario' : 'primario'}
              onPress={() => alternarSeguir(p)} />
          )}
        </View>
      ))}
    </Folha>
  )
}

const estilos = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm, paddingVertical: 6 },
  pessoa: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: espaco.md },
  nome: { color: cores.texto, fontWeight: '700' },
  bio: { color: cores.textoApagado, fontSize: 13 },
  vazio: { color: cores.textoApagado, textAlign: 'center', paddingVertical: espaco.xl },
})

export default ListaPessoas
