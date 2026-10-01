// ESLint com as regras recomendadas da Expo (npx expo lint)
const { defineConfig, globalIgnores } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')

module.exports = defineConfig([
  globalIgnores(['dist/*', 'web-build/*', 'coverage/*']),
  expoConfig,
])
