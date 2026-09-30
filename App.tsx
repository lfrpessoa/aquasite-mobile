import React, { Suspense, lazy, useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider } from './src/contexts/AuthContext'
import { PresencaProvider } from './src/contexts/PresencaContext'
import { carregarPreferencias } from './src/theme/preferencias'
import { cores, preferencias } from './src/theme/cores'

// As telas são carregadas só DEPOIS de aplicar o tema escolhido (claro, escuro ou alto contraste),
// porque cada uma monta os próprios estilos com as cores do momento em que é carregada.
const RootNavigator = lazy(() => import('./src/navigation/RootNavigator'))

/** AquaSite Mobile: cliente React Native da MESMA API e do MESMO banco usados pelo site. */
export default function App() {
  const [pronto, setPronto] = useState(false)

  useEffect(() => {
    carregarPreferencias().finally(() => setPronto(true))
  }, [])

  const espera = (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: cores.fundo }}>
      <ActivityIndicator size="large" color={cores.destaque} />
    </View>
  )

  if (!pronto) return espera

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PresencaProvider>
          <StatusBar style={preferencias.tema === 'claro' ? 'dark' : 'light'} />
          <Suspense fallback={espera}>
            <RootNavigator />
          </Suspense>
        </PresencaProvider>
      </AuthProvider>
    </SafeAreaProvider>
  )
}
