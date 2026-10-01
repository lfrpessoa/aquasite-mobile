const mockResize = jest.fn()
jest.mock('expo-image-picker', () => ({}))
jest.mock('expo-image-manipulator', () => ({
  SaveFormat: { JPEG: 'jpeg' },
  ImageManipulator: {
    manipulate: () => ({
      resize: (tamanho: unknown) => { mockResize(tamanho); return undefined },
      renderAsync: async () => ({ saveAsync: async () => ({ base64: 'AAAA' }) }),
    }),
  },
}))

import { reduzirImagem } from '../utils/imagem'

describe('reduzir imagem antes de enviar', () => {
  beforeEach(() => mockResize.mockClear())

  it('foto deitada: passa largura e altura (a versão web quebra com null)', async () => {
    expect(await reduzirImagem('x', 4000, 3000, 512)).toBe('data:image/jpeg;base64,AAAA')
    expect(mockResize).toHaveBeenCalledWith({ width: 512, height: 384 })
  })
  it('foto em pé', async () => {
    await reduzirImagem('x', 3000, 4000, 1080)
    expect(mockResize).toHaveBeenCalledWith({ width: 810, height: 1080 })
  })
  it('foto pequena não é redimensionada', async () => {
    await reduzirImagem('x', 300, 200, 512)
    expect(mockResize).not.toHaveBeenCalled()
  })
})
