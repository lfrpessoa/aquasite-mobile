import React, { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Icone from './Icone'
import { useLocalizacao } from '../hooks/useLocalizacao'
import { buscarCondicoes } from '../services/clima'
import type { Condicoes } from '../services/clima'
import { praiaMaisProxima, condicaoPorCodigo } from '../utils/praias'
import { riscosMaritimos } from '../utils/riscoMaritimo'
import { numero } from '../utils/formatar'
import { cores, espaco, raio } from '../theme/tema'

/** Cartão "Praia mais próxima" do topo do feed (no site fica na barra lateral). Toque para abrir no Mapa. */
const PraiaProxima = ({ aoAbrirMapa }: { aoAbrirMapa: () => void }) => {
  const loc = useLocalizacao()
  const [cond, setCond] = useState<Condicoes | null>(null)
  const perto = loc.estado === 'ok' ? praiaMaisProxima(loc.lat, loc.lon) : null

  useEffect(() => {
    if (!perto) return
    buscarCondicoes(perto.praia.lat, perto.praia.lon).then(setCond).catch(() => setCond(null))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só quando a praia muda
  }, [perto?.praia.nome])

  if (loc.estado === 'negado' || loc.estado === 'erro') {
    return (
      <Pressable style={estilos.cartao} onPress={aoAbrirMapa} accessibilityRole="button">
        <Text style={estilos.titulo}>Praia mais próxima</Text>
        <Text style={estilos.suave}>Permita a localização para ver a praia mais próxima e as condições do mar. Toque para abrir o Mapa.</Text>
      </Pressable>
    )
  }
  if (!perto) {
    return <View style={estilos.cartao}><Text style={estilos.titulo}>Praia mais próxima</Text><Text style={estilos.suave}>Localizando você...</Text></View>
  }

  const c = cond?.clima?.current
  const m = cond?.mar?.current
  const [alerta] = riscosMaritimos({ clima: c, mar: m })
  const condicao = c ? condicaoPorCodigo(c.weather_code) : null

  return (
    <Pressable style={estilos.cartao} onPress={aoAbrirMapa} accessibilityRole="button"
      accessibilityLabel={`Praia mais próxima: ${perto.praia.nome}. Toque para ver no Mapa`}>
      <View style={estilos.linha}>
        <Text style={estilos.titulo}>Praia mais próxima</Text>
        <Icone nome="arrow-right" tamanho={16} cor={cores.destaque} />
      </View>
      <Text style={estilos.nome}>{perto.praia.nome}</Text>
      <Text style={estilos.suave}>{perto.praia.cidade} - {perto.praia.uf} · ~{Math.round(perto.km)} km</Text>
      <View style={estilos.dados}>
        {c && condicao && (
          <View style={estilos.dado}><Icone nome={condicao.icone} tamanho={16} cor={cores.destaque} />
            <Text style={estilos.texto}>{numero(c.temperature_2m)}°C</Text></View>
        )}
        {m?.wave_height != null && (
          <View style={estilos.dado}><Icone nome="waves" tamanho={16} cor={cores.destaque} />
            <Text style={estilos.texto}>Ondas {numero(m.wave_height)} m</Text></View>
        )}
        {m?.sea_surface_temperature != null && (
          <View style={estilos.dado}><Icone nome="thermometer" tamanho={16} cor={cores.destaque} />
            <Text style={estilos.texto}>Água {numero(m.sea_surface_temperature)}°C</Text></View>
        )}
      </View>
      {alerta && (
        <View style={[estilos.alerta, alerta.nivel === 'perigo' ? estilos.perigo : estilos.atencao]}>
          <Icone nome={alerta.icone} tamanho={15} cor={alerta.nivel === 'perigo' ? cores.erro : cores.atencao} />
          <Text style={estilos.alertaTexto}>{alerta.texto}</Text>
        </View>
      )}
    </Pressable>
  )
}

const estilos = StyleSheet.create({
  cartao: { backgroundColor: cores.painel, borderRadius: raio.lg, borderWidth: 1, borderColor: cores.borda, padding: espaco.lg, gap: 4 },
  linha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titulo: { color: cores.destaque, fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  nome: { color: cores.texto, fontSize: 17, fontWeight: '700', marginTop: 4 },
  suave: { color: cores.textoApagado, fontSize: 13 },
  dados: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.md, marginTop: espaco.sm },
  dado: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  texto: { color: cores.textoSuave, fontSize: 13 },
  alerta: { flexDirection: 'row', gap: 6, borderRadius: raio.sm, borderWidth: 1, padding: 8, marginTop: espaco.sm },
  perigo: { backgroundColor: cores.erroFundo, borderColor: 'rgba(255,107,107,0.35)' },
  atencao: { backgroundColor: cores.atencaoFundo, borderColor: 'rgba(255,167,38,0.4)' },
  alertaTexto: { color: cores.texto, fontSize: 12, flex: 1, lineHeight: 17 },
})

export default PraiaProxima
