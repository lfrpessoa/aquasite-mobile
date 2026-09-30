import { riscosMaritimos } from '../utils/riscoMaritimo'

// Mesmas regras de alerta do Mapa do site (componentes/praia/riscoMaritimo.js).
describe('alertas de risco marítimo', () => {
  it('sem dados, sem alerta', () => {
    expect(riscosMaritimos({ clima: null, mar: null })).toEqual([])
  })

  it('mar calmo e vento fraco não geram alerta', () => {
    expect(riscosMaritimos({ clima: { wind_speed_10m: 10, wind_gusts_10m: 20 }, mar: { wave_height: 0.8 } })).toEqual([])
  })

  it('ondas de 1,5 m geram atenção; de 2,5 m geram perigo', () => {
    expect(riscosMaritimos({ clima: null, mar: { wave_height: 1.6 } })[0].nivel).toBe('atencao')
    const perigo = riscosMaritimos({ clima: null, mar: { wave_height: 2.8 } })
    expect(perigo[0].nivel).toBe('perigo')
    expect(perigo[0].texto).toContain('2,8 m')
  })

  it('rajadas fortes com vento fraco citam as rajadas, não o vento', () => {
    const [alerta] = riscosMaritimos({ clima: { wind_speed_10m: 6, wind_gusts_10m: 51 }, mar: null })
    expect(alerta.nivel).toBe('atencao')
    expect(alerta.texto).toContain('Rajadas de vento de até 51 km/h')
  })

  it('vento de 55 km/h é perigo', () => {
    const [alerta] = riscosMaritimos({ clima: { wind_speed_10m: 55, wind_gusts_10m: 70 }, mar: null })
    expect(alerta.nivel).toBe('perigo')
    expect(alerta.texto).toContain('Vento de 55 km/h')
  })

  it('trovoada é perigo e vem antes dos alertas de atenção', () => {
    const alertas = riscosMaritimos({ clima: { weather_code: 95 }, mar: { wave_height: 1.6, ocean_current_velocity: 3.5 } })
    expect(alertas[0].nivel).toBe('perigo')
    expect(alertas[0].icone).toBe('cloud-lightning')
    expect(alertas.slice(1).every(a => a.nivel === 'atencao')).toBe(true)
  })

  it('ressaca prevista para os próximos dias', () => {
    const [alerta] = riscosMaritimos({ clima: null, mar: { wave_height: 0.8 }, dias: [{ onda: 2.6, rotulo: 'qui. 02' }] })
    expect(alerta.texto).toBe('Ressaca prevista para qui. 02: ondas de até 2,6 m.')
  })

  it('não repete a ressaca quando o mar já está agitado agora', () => {
    const alertas = riscosMaritimos({ clima: null, mar: { wave_height: 3 }, dias: [{ onda: 3, rotulo: 'qui. 02' }] })
    expect(alertas).toHaveLength(1)
  })
})
