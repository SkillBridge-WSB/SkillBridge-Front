import { useEffect } from 'react'
import { DarkTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { SplashScreen, Stack } from 'expo-router'
import { Provider } from 'app/provider'
import { QueryProvider } from 'app/providers/query-provider.native'
import { AuthProvider } from 'app/contexts/auth-context'
import { NativeToast } from '@my/ui/src/NativeToast'

// Custom dark theme matching our color palette
const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#CC5500', // Primary accent
    background: '#1A1A1A', // Background App
    card: '#282828', // Surface / Card BG
    text: '#FFFFFF', // Text Primary
    border: '#282828', // Border color
    notification: '#D32F2F', // Danger
  },
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [interLoaded, interError] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  })

  useEffect(() => {
    if (interLoaded || interError) {
      // Hide the splash screen after the fonts have loaded (or an error was returned) and the UI is ready.
      SplashScreen.hideAsync()
    }
  }, [interLoaded, interError])

  if (!interLoaded && !interError) {
    return null
  }

  return (
    <QueryProvider>
      <Provider defaultTheme="dark">
        <AuthProvider>
          <ThemeProvider value={customDarkTheme}>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { flex: 1 },
              }}
            />
            <NativeToast />
          </ThemeProvider>
        </AuthProvider>
      </Provider>
    </QueryProvider>
  )
}
