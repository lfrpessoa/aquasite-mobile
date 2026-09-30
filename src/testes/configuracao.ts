// Configuração dos testes automatizados (Jest + jest-expo).
// O AsyncStorage não existe fora do celular: nos testes ele é trocado pela versão em memória
// que a própria biblioteca fornece.
jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'))
