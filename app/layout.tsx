'use client'
import type { ReactNode } from 'react'
import '@styles/globals.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import 'yet-another-react-lightbox/plugins/captions.css'

import { Shell } from '@components/shell/Shell'
import { CommandPaletteRoot } from '@components/shell/CommandPalette/Root'
import { AuthProvider } from '@components/shell/AuthContext'
import { DefaultQueryClientProvider } from '@components/shell/QueryClient'
import { GlobalQueryClientProvider } from '@components/shell/QueryClient'
import { isDarkModeEnabled } from '@components/common/useColorScheme'
import { HANDLE_RESOLVER_URL, PLC_DIRECTORY_URL } from '@lib/constants'
import { ConfigProvider } from '@components/shell/ConfigContext'
import { ConfigurationProvider } from '@components/shell/ConfigurationContext'
import { ExternalLabelersProvider } from '@components/shell/ExternalLabelersContext'
import { ThemeProvider } from '@components/common/ThemeProvider'

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <GlobalQueryClientProvider>
      <ConfigProvider>
        <AuthProvider
          plcDirectoryUrl={PLC_DIRECTORY_URL}
          handleResolver={HANDLE_RESOLVER_URL}
        >
          <DefaultQueryClientProvider>
            <ConfigurationProvider>
              <ExternalLabelersProvider>
                <CommandPaletteRoot>
                  <Shell>{children}</Shell>
                </CommandPaletteRoot>
              </ExternalLabelersProvider>
            </ConfigurationProvider>
          </DefaultQueryClientProvider>
        </AuthProvider>
      </ConfigProvider>
    </GlobalQueryClientProvider>
  )
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  const isLocal =
    typeof window !== 'undefined'
      ? window?.location.host.includes('localhost:')
      : false

  return (
    <html lang="en" className="h-full">
      <head>
        <title>SkyGuard PH - Content Moderation Platform</title>
        <link
          rel="icon"
          href={`/img/logo-${isLocal ? 'white' : 'colorful'}.png`}
          sizes="any"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Professional Content Moderation Platform" />
      </head>
      <body className="h-full overflow-hidden bg-background-light dark:bg-background-dark">
        <ThemeProvider>
          {/* Custom Navigation Header */}
          <header className="bg-primary dark:bg-primary-dark text-white py-4 px-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <img 
                  src="/img/logo-white.png" 
                  alt="SkyGuard PH Logo" 
                  className="h-8 w-auto"
                />
                <h1 className="text-xl font-bold">SkyGuard PH</h1>
              </div>
              <nav className="hidden md:flex space-x-6">
                <a href="/events" className="nav-link text-white hover:text-secondary-light">Events</a>
                <a href="/reports" className="nav-link text-white hover:text-secondary-light">Reports</a>
                <a href="/search" className="nav-link text-white hover:text-secondary-light">Search</a>
                <a href="/configure" className="nav-link text-white hover:text-secondary-light">Configure</a>
              </nav>
            </div>
          </header>

          {/* Toast Container with custom styling */}
          <ToastContainer
            position="bottom-right"
            autoClose={4000}
            hideProgressBar={false}
            closeOnClick
            theme={isDarkModeEnabled() ? 'dark' : 'light'}
            toastClassName="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            progressClassName="bg-secondary"
          />

          <main className="h-[calc(100vh-4rem)] overflow-auto">
            <Providers>{children}</Providers>
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
