import * as ImagePicker from 'expo-image-picker'
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'

/** Maior lado da foto enviada: posts e mensagens até 1080 px; foto de perfil até 512 px. */
export const LADO_MAXIMO_POST = 1080
export const LADO_MAXIMO_PERFIL = 512

/**
 * Escolhe uma foto da galeria (ou tira com a câmera), reduz para no máximo `ladoMaximo` px e
 * devolve no mesmo formato que o site envia para a API: um data URL em Base64 (JPEG).
 * Assim o app manda fotos de ~150–300 KB em vez de vários MB — a API guarda a imagem no banco.
 * Devolve null se a pessoa cancelar; lança erro se a permissão for negada.
 */
export async function escolherImagem(origem: 'galeria' | 'camera' = 'galeria', quadrada = false,
  ladoMaximo = quadrada ? LADO_MAXIMO_PERFIL : LADO_MAXIMO_POST): Promise<string | null> {
  const permissao = origem === 'camera'
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync()
  if (!permissao.granted) {
    throw new Error(origem === 'camera'
      ? 'Permita o acesso à câmera nas configurações do celular.'
      : 'Permita o acesso às fotos nas configurações do celular.')
  }
  const opcoes: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    quality: 1, // a compressão é feita abaixo, depois de reduzir o tamanho
    allowsEditing: quadrada,
    aspect: quadrada ? [1, 1] : undefined,
  }
  const resultado = origem === 'camera'
    ? await ImagePicker.launchCameraAsync(opcoes)
    : await ImagePicker.launchImageLibraryAsync(opcoes)
  if (resultado.canceled || !resultado.assets?.[0]) return null
  return reduzirImagem(resultado.assets[0].uri, resultado.assets[0].width, resultado.assets[0].height, ladoMaximo)
}

/** Reduz a imagem para caber em `ladoMaximo` px (mantendo a proporção) e devolve um data URL JPEG. */
export async function reduzirImagem(uri: string, largura: number, altura: number, ladoMaximo: number): Promise<string> {
  const contexto = ImageManipulator.manipulate(uri)
  if (Math.max(largura, altura) > ladoMaximo) {
    // Passa as duas medidas já calculadas: na versão web, o expo-image-manipulator trata
    // `null` como altura 0 e o navegador recusa ("The index is not in the allowed range").
    const escala = ladoMaximo / Math.max(largura, altura)
    contexto.resize({ width: Math.round(largura * escala), height: Math.round(altura * escala) })
  }
  const imagem = await contexto.renderAsync()
  const salva = await imagem.saveAsync({ format: SaveFormat.JPEG, compress: 0.7, base64: true })
  if (!salva.base64) throw new Error('Não foi possível preparar a imagem.')
  return `data:image/jpeg;base64,${salva.base64}`
}

/** Tamanho aproximado, em KB, de uma imagem em data URL (para mostrar ou conferir). */
export function tamanhoKb(dataUrl: string): number {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
  return Math.round((base64.length * 3) / 4 / 1024)
}
