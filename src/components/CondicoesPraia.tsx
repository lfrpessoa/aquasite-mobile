import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Icone from './Icone'
import type { NomeIcone } from './Icone'
import type { Condicoes } from '../services/clima'
import { condicaoPorCodigo, estadoDoMar, nivelUV, pontoCardeal } from '../utils/praias'
import { riscosMaritimos } from '../utils/riscoMaritimo'
import { diaSemana, numero } from '../utils/formatar'
import { base, cores, espaco, raio } from '../theme/tema'

/** Alertas, tempo, mar, maré e próximos dias de uma praia — os mesmos cartões da página Mapa do site. */
const CondicoesPraia = ({ dados }: { dados: Condicoes }) => {
  const c = dados.clima?.current
  const d = dados.clima?.daily
  const m = dados.mar?.current

  const dias = d ? d.time.slice(1, 4).map((t, i) => ({
    t,
    max: d.temperature_2m_max[i + 1], min: d.temperature_2m_min[i + 1],
    chuva: d.precipitation_probability_max?.[i + 1] ?? null,
    cond: condicaoPorCodigo(d.weather_code[i + 1]),
    onda: dados.mar?.daily?.wave_height_max?.[i + 1] ?? null,
  })) : []

  const alertas = riscosMaritimos({ clima: c, mar: m, dias: dias.map(x => ({ onda: x.onda, rotulo: diaSemana(x.t) })) })

  // maré das próximas 24 h, de 3 em 3 horas
  let mare: { hora: string; v: number }[] = []
  const h = dados.mar?.hourly
  if (h && m) {
    const inicio = h.time.indexOf(`${m.time.slice(0, 13)}:00`)
    if (inicio >= 0) {
      mare = h.time.slice(inicio, inicio + 25)
        .map((t, i) => ({ hora: t.slice(11, 16), v: h.sea_level_height_msl[inicio + i] }))
        .filter((p, i): p is { hora: string; v: number } => p.v != null && i % 3 === 0)
    }
  }
  const menor = Math.min(...mare.map(p => p.v))
  const maior = Math.max(...mare.map(p => p.v))

  const uv = c ? nivelUV(c.uv_index) : null
  const cond = c ? condicaoPorCodigo(c.weather_code) : null

  return (
    <View style={{ gap: espaco.md }}>
      {(c || m) && (alertas.length > 0 ? (
        <View style={base.cartao} accessibilityLabel="Alertas de risco marítimo">
          <View style={estilos.tituloLinha}><Icone nome="alert" tamanho={16} cor={cores.destaque} /><Text style={base.tituloSecao}>Alertas do mar</Text></View>
          {alertas.map((a, i) => (
            <View key={i} style={[estilos.alerta, a.nivel === 'perigo' ? estilos.perigo : estilos.atencao]} accessibilityRole="alert">
              <Icone nome={a.icone} tamanho={16} cor={a.nivel === 'perigo' ? cores.erro : cores.atencao} />
              <Text style={estilos.alertaTexto}><Text style={{ fontWeight: '700' }}>{a.nivel === 'perigo' ? 'Perigo' : 'Atenção'}: </Text>{a.texto}</Text>
            </View>
          ))}
          <Text style={estilos.nota}>Calculado automaticamente com os dados do Open-Meteo. Siga sempre os avisos dos salva-vidas e da Defesa Civil.</Text>
        </View>
      ) : (
        <View style={estilos.semAlerta}><Icone nome="check" tamanho={15} cor={cores.ok} /><Text style={{ color: cores.ok, fontSize: 13 }}>Sem alertas de risco marítimo agora.</Text></View>
      ))}

      {c && cond && (
        <View style={base.cartao}>
          <Text style={base.tituloSecao}>Tempo agora</Text>
          <View style={estilos.destaque}>
            <Icone nome={cond.icone} tamanho={34} cor={cores.destaque} />
            <View>
              <Text style={estilos.grande}>{numero(c.temperature_2m)}°C</Text>
              <Text style={base.textoSuave}>{cond.texto} · sensação {numero(c.apparent_temperature)}°C</Text>
            </View>
          </View>
          <View style={estilos.grade}>
            <Dado icone="wind" rotulo="Vento" valor={`${numero(c.wind_speed_10m, 0)} km/h ${pontoCardeal(c.wind_direction_10m)}`} />
            <Dado icone="droplet" rotulo="Umidade" valor={`${c.relative_humidity_2m}%`} />
            <Dado icone="sun" rotulo="Índice UV" valor={`${numero(c.uv_index, 0)}${uv ? ` · ${uv.texto}` : ''}`} cor={uv?.cor} />
            {d && <Dado icone="sunrise" rotulo="Sol" valor={`${d.sunrise[0].slice(11, 16)} – ${d.sunset[0].slice(11, 16)}`} />}
          </View>
        </View>
      )}

      {m ? (
        <View style={base.cartao}>
          <Text style={base.tituloSecao}>Mar</Text>
          <View style={estilos.destaque}>
            <Icone nome="waves" tamanho={34} cor={cores.destaque} />
            <View>
              <Text style={estilos.grande}>{numero(m.wave_height)} m</Text>
              <Text style={base.textoSuave}>{estadoDoMar(m.wave_height)}</Text>
            </View>
          </View>
          <View style={estilos.grade}>
            <Dado icone="thermometer" rotulo="Água" valor={`${numero(m.sea_surface_temperature)}°C`} />
            <Dado icone="waves" rotulo="Ondas vêm de" valor={`${pontoCardeal(m.wave_direction)} · ${numero(m.wave_period, 0)} s`} />
            <Dado icone="waves" rotulo="Swell" valor={`${numero(m.swell_wave_height)} m`} />
            <Dado icone="navigation" rotulo="Correnteza" valor={`${numero(m.ocean_current_velocity)} km/h`} />
          </View>
        </View>
      ) : (
        <Text style={base.textoSuave}>Não há dados do mar para este ponto. Ele pode estar longe da costa: toque mais perto da água.</Text>
      )}

      {mare.length > 1 && (
        <View style={base.cartao} accessibilityLabel={`Maré nas próximas 24 horas, de ${numero(menor, 2)} a ${numero(maior, 2)} metros`}>
          <Text style={base.tituloSecao}>Maré nas próximas 24 h</Text>
          <View style={estilos.mare}>
            {mare.map(p => {
              const fracao = maior > menor ? (p.v - menor) / (maior - menor) : 0.5
              return (
                <View key={p.hora} style={estilos.mareColuna}>
                  <Text style={estilos.mareValor}>{numero(p.v, 1)}</Text>
                  <View style={estilos.mareTrilho}><View style={[estilos.mareBarra, { height: `${20 + fracao * 80}%` }]} /></View>
                  <Text style={estilos.mareHora}>{p.hora.slice(0, 2)}h</Text>
                </View>
              )
            })}
          </View>
          <Text style={estilos.nota}>Estimativa de modelo em metros (horário local da praia). Não use para navegação.</Text>
        </View>
      )}

      {dias.length > 0 && (
        <View style={base.cartao}>
          <Text style={base.tituloSecao}>Próximos dias</Text>
          {dias.map(x => (
            <View key={x.t} style={estilos.dia}>
              <Text style={[estilos.diaNome]}>{diaSemana(x.t)}</Text>
              <Icone nome={x.cond.icone} tamanho={18} cor={cores.destaque} />
              <Text style={estilos.diaTexto}>{numero(x.min, 0)}° / {numero(x.max, 0)}°</Text>
              <Text style={estilos.diaSuave}>{x.chuva != null ? `${x.chuva}% chuva` : ''}</Text>
              <Text style={estilos.diaSuave}>{x.onda != null ? `ondas ${numero(x.onda)} m` : ''}</Text>
            </View>
          ))}
        </View>
      )}
      <Text style={estilos.fontes}>Dados: Open-Meteo (tempo, mar e maré) · OpenStreetMap (busca)</Text>
    </View>
  )
}

const Dado = ({ icone, rotulo, valor, cor }: { icone: NomeIcone; rotulo: string; valor: string; cor?: string }) => (
  <View style={estilos.dado} accessible accessibilityLabel={`${rotulo}: ${valor}`}>
    <View style={estilos.dadoRotulo}><Icone nome={icone} tamanho={13} cor={cores.textoApagado} /><Text style={base.textoSuave}>{rotulo}</Text></View>
    <Text style={[estilos.dadoValor, cor ? { color: cor } : null]}>{valor}</Text>
  </View>
)

const estilos = StyleSheet.create({
  tituloLinha: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  alerta: { flexDirection: 'row', gap: 8, borderRadius: raio.md, borderWidth: 1, padding: 10, marginBottom: 8 },
  perigo: { backgroundColor: cores.erroFundo, borderColor: 'rgba(255,107,107,0.35)' },
  atencao: { backgroundColor: cores.atencaoFundo, borderColor: 'rgba(255,167,38,0.4)' },
  alertaTexto: { color: cores.texto, fontSize: 13, lineHeight: 19, flex: 1 },
  nota: { color: cores.textoApagado, fontSize: 11, marginTop: 6 },
  semAlerta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  destaque: { flexDirection: 'row', alignItems: 'center', gap: espaco.md, marginBottom: espaco.md },
  grande: { color: cores.texto, fontSize: 30, fontWeight: '800' },
  grade: { flexDirection: 'row', flexWrap: 'wrap', rowGap: espaco.md },
  dado: { width: '50%', gap: 2 },
  dadoRotulo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dadoValor: { color: cores.texto, fontSize: 15, fontWeight: '600' },
  mare: { flexDirection: 'row', justifyContent: 'space-between', height: 120, marginTop: 4 },
  mareColuna: { alignItems: 'center', flex: 1 },
  mareValor: { color: cores.textoApagado, fontSize: 10 },
  mareTrilho: { flex: 1, width: 12, justifyContent: 'flex-end', marginVertical: 4 },
  mareBarra: { width: 12, borderRadius: 6, backgroundColor: cores.destaque },
  mareHora: { color: cores.textoApagado, fontSize: 10 },
  dia: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm, paddingVertical: 6 },
  diaNome: { color: cores.texto, width: 64, fontWeight: '600' },
  diaTexto: { color: cores.texto, width: 70 },
  diaSuave: { color: cores.textoApagado, fontSize: 12, flex: 1 },
  fontes: { color: cores.textoApagado, fontSize: 11, textAlign: 'center' },
})

export default CondicoesPraia
