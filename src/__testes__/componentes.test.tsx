import React from 'react'
import type { ReactElement } from 'react'
import { Alert } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { fireEvent, render, screen } from '@testing-library/react-native'
import Botao from '../components/Botao'
import PostCard from '../components/PostCard'
import AnimaisScreen from '../screens/AnimaisScreen'
import type { Post } from '../types/api'

// A página de animais busca as espécies do banco: aqui a API é simulada.
const mockListarEspecies = jest.fn()
jest.mock('../services/api', () => ({ especies: { listar: () => mockListarEspecies() } }))

// No app, o SafeAreaProvider vem do App.tsx; nos testes, cada tela é montada dentro dele.
const MEDIDAS = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } }
const montar = (elemento: ReactElement) => render(<SafeAreaProvider initialMetrics={MEDIDAS}>{elemento}</SafeAreaProvider>)

const post: Post = {
  id: 1, user: '@ana', content: 'Vi uma tartaruga hoje!', image: null, likes: 3, curtiu: false,
  time: '10:00', comments: [{ id: 9, user: 'bia', text: 'Que lindo!' }],
}

describe('Botao', () => {
  it('chama a ação ao tocar e fica bloqueado quando desativado', async () => {
    const acao = jest.fn()
    const { rerender } = await montar(<Botao titulo="Publicar" onPress={acao} />)
    await fireEvent.press(screen.getByRole('button', { name: 'Publicar' }))
    expect(acao).toHaveBeenCalledTimes(1)
    await rerender(<SafeAreaProvider initialMetrics={MEDIDAS}><Botao titulo="Publicar" onPress={acao} desativado /></SafeAreaProvider>)
    await fireEvent.press(screen.getByRole('button', { name: 'Publicar' }))
    expect(acao).toHaveBeenCalledTimes(1)
  })
})

describe('PostCard', () => {
  it('mostra o texto e curte', async () => {
    const curtir = jest.fn()
    await montar(<PostCard post={post} eu="bia" onCurtir={curtir} />)
    expect(screen.getByText('Vi uma tartaruga hoje!')).toBeTruthy()
    await fireEvent.press(screen.getByRole('button', { name: 'Curtir. 3 curtidas' }))
    expect(curtir).toHaveBeenCalledWith(post)
  })

  it('abre os comentários', async () => {
    await montar(<PostCard post={post} eu="bia" />)
    await fireEvent.press(screen.getByRole('button', { name: 'Comentários: 1' }))
    expect(screen.getByText(/Que lindo!/)).toBeTruthy()
  })

  it('outra pessoa vê "Denunciar"; só o autor vê "Apagar", que pede confirmação', async () => {
    const alerta = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined)
    await montar(<PostCard post={post} eu="bia" onApagar={jest.fn()} />)
    expect(screen.queryByRole('button', { name: 'Apagar post' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Denunciar post' })).toBeTruthy()
    await montar(<PostCard post={post} eu="ana" onApagar={jest.fn()} />)
    await fireEvent.press(screen.getByRole('button', { name: 'Apagar post' }))
    expect(alerta).toHaveBeenCalledWith('Apagar post', expect.any(String), expect.any(Array))
    alerta.mockRestore()
  })

  it('post oculto por denúncias mostra o aviso para o autor', async () => {
    await montar(<PostCard post={{ ...post, oculto: true }} eu="ana" />)
    expect(screen.getByText(/Oculto do feed por denúncias/)).toBeTruthy()
  })
})

describe('Animais Marinhos', () => {
  const especie = (id: number, nome: string, categoria: string, nomeCientifico: string | null = null) =>
    ({ id, nome, categoria, nomeCientifico, descricao: `Sobre ${nome}.`, habitat: 'Recifes', imagem: null })

  it('lista as espécies cadastradas no banco, filtra por grupo, busca e abre a ficha', async () => {
    mockListarEspecies.mockResolvedValue([
      especie(1, 'Tartaruga-verde', 'Réptil', 'Chelonia mydas'),
      especie(2, 'Tubarão-baleia', 'Peixe', 'Rhincodon typus'),
      especie(3, 'Peixe-palhaço', 'Peixe'),
    ])
    await montar(<AnimaisScreen />)
    expect(await screen.findByText('3 espécies catalogadas', {}, { timeout: 5000 })).toBeTruthy()
    await fireEvent.press(screen.getByRole('radio', { name: 'Peixe' }))
    expect(screen.getByText('2 espécies catalogadas')).toBeTruthy()
    await fireEvent.press(screen.getByRole('radio', { name: 'Todos' }))
    await fireEvent.changeText(screen.getByLabelText('Buscar animal pelo nome'), 'chelonia')
    expect(screen.getByText('1 espécie catalogada')).toBeTruthy()
    await fireEvent.press(screen.getByRole('button', { name: /Tartaruga-verde/ }))
    expect(screen.getByText('Sobre Tartaruga-verde.')).toBeTruthy()
  })

  it('sem conexão com a API, mostra as 35 espécies de reserva e avisa', async () => {
    mockListarEspecies.mockRejectedValue(new Error('sem rede'))
    await montar(<AnimaisScreen />)
    expect(await screen.findByText('35 espécies catalogadas', {}, { timeout: 5000 })).toBeTruthy()
    expect(screen.getByText(/Sem conexão com o servidor/)).toBeTruthy()
    await fireEvent.press(screen.getByRole('radio', { name: 'Mamífero' }))
    expect(screen.getByText('8 espécies catalogadas')).toBeTruthy()
  })
})
