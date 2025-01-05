import { ReactNode } from 'react'

declare module 'react-toastify' {
  export const ToastContainer: React.FC<{
    position?: string
    autoClose?: number
    hideProgressBar?: boolean
    closeOnClick?: boolean
    theme?: 'light' | 'dark'
    toastClassName?: string
    progressClassName?: string
  }>
}

interface AuthProviderProps {
  children: ReactNode
  plcDirectoryUrl: string
  handleResolver: string
}

interface ConfigProviderProps {
  children: ReactNode
}

interface QueryClientProviderProps {
  children: ReactNode
}

interface ConfigurationProviderProps {
  children: ReactNode
}

interface ExternalLabelersProviderProps {
  children: ReactNode
}

interface CommandPaletteRootProps {
  children: ReactNode
}

interface ShellProps {
  children: ReactNode
}

declare module '@components/shell/AuthContext' {
  export const AuthProvider: React.FC<AuthProviderProps>
}

declare module '@components/shell/ConfigContext' {
  export const ConfigProvider: React.FC<ConfigProviderProps>
}

declare module '@components/shell/QueryClient' {
  export const DefaultQueryClientProvider: React.FC<QueryClientProviderProps>
  export const GlobalQueryClientProvider: React.FC<QueryClientProviderProps>
}

declare module '@components/shell/ConfigurationContext' {
  export const ConfigurationProvider: React.FC<ConfigurationProviderProps>
}

declare module '@components/shell/ExternalLabelersContext' {
  export const ExternalLabelersProvider: React.FC<ExternalLabelersProviderProps>
}

declare module '@components/shell/CommandPalette/Root' {
  export const CommandPaletteRoot: React.FC<CommandPaletteRootProps>
}

declare module '@components/shell/Shell' {
  export const Shell: React.FC<ShellProps>
}

declare module '@components/common/useColorScheme' {
  export function isDarkModeEnabled(): boolean
}