'use client'

import { createContext, useContext, useEffect, ReactNode, useSyncExternalStore, useMemo } from 'react'
import { useTelegram } from '@/hooks/useTelegram'

interface TelegramContextType {
  isTelegram: boolean
  user: {
    id: number
    first_name: string
    last_name?: string
    username?: string
    language_code?: string
    is_premium?: boolean
  } | null
  themeParams: {
    bg_color?: string
    text_color?: string
    hint_color?: string
    link_color?: string
    button_color?: string
    button_text_color?: string
    secondary_bg_color?: string
  } | null
  colorScheme: 'light' | 'dark' | null
  platform: string | null
  expand: () => void
  close: () => void
  haptic: {
    impact: (style?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notification: (type: 'error' | 'success' | 'warning') => void
    selection: () => void
  }
  showAlert: (message: string) => Promise<void>
  showConfirm: (message: string) => Promise<boolean>
}

const TelegramContext = createContext<TelegramContextType | null>(null)

export function useTelegramContext() {
  const context = useContext(TelegramContext)
  return context
}

interface TelegramProviderProps {
  children: ReactNode
}

// Функции для useSyncExternalStore
function subscribeToMounted(callback: () => void): () => void {
  // Нет подписки - только начальное определение
  return () => {}
}

function getClientMountedSnapshot(): boolean {
  return true
}

function getServerMountedSnapshot(): boolean {
  return false
}

export function TelegramProvider({ children }: TelegramProviderProps) {
  const telegram = useTelegram()
  
  // Безопасное определение mounted состояния
  const mounted = useSyncExternalStore(
    subscribeToMounted,
    getClientMountedSnapshot,
    getServerMountedSnapshot
  )

  // Применяем стили Telegram если запущено в Telegram
  useEffect(() => {
    if (telegram.isTelegram && telegram.themeParams) {
      const root = document.documentElement
      
      if (telegram.themeParams.bg_color) {
        root.style.setProperty('--background', telegram.themeParams.bg_color)
      }
      if (telegram.themeParams.text_color) {
        root.style.setProperty('--foreground', telegram.themeParams.text_color)
      }
      if (telegram.themeParams.secondary_bg_color) {
        root.style.setProperty('--card', telegram.themeParams.secondary_bg_color)
        root.style.setProperty('--popover', telegram.themeParams.secondary_bg_color)
      }
      if (telegram.themeParams.button_color) {
        root.style.setProperty('--primary', telegram.themeParams.button_color)
      }
      if (telegram.themeParams.button_text_color) {
        root.style.setProperty('--primary-foreground', telegram.themeParams.button_text_color)
      }
      if (telegram.themeParams.hint_color) {
        root.style.setProperty('--muted-foreground', telegram.themeParams.hint_color)
      }
      if (telegram.themeParams.link_color) {
        root.style.setProperty('--accent', telegram.themeParams.link_color)
      }
    }
  }, [telegram.isTelegram, telegram.themeParams])

  // Мемоизируем значение контекста
  const contextValue = useMemo<TelegramContextType>(() => ({
    isTelegram: telegram.isTelegram,
    user: telegram.user,
    themeParams: telegram.themeParams,
    colorScheme: telegram.colorScheme,
    platform: telegram.platform,
    expand: telegram.expand,
    close: telegram.close,
    haptic: telegram.haptic,
    showAlert: telegram.showAlert,
    showConfirm: telegram.showConfirm,
  }), [telegram])

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <TelegramContext.Provider value={contextValue}>
      {children}
    </TelegramContext.Provider>
  )
}

// Компонент для отображения информации о Telegram пользователе
export function TelegramUserInfo() {
  const telegram = useTelegramContext()
  
  if (!telegram?.isTelegram || !telegram.user) {
    return null
  }
  
  return (
    <div className="fixed top-2 right-14 z-50 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
      TG: {telegram.user.first_name} {telegram.user.last_name}
    </div>
  )
}

// HOC для обёртки компонентов с Telegram функционалом
export function withTelegram<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    requireTelegram?: boolean
    expandOnMount?: boolean
  }
) {
  return function TelegramWrappedComponent(props: P) {
    const telegram = useTelegramContext()
    
    useEffect(() => {
      if (options?.expandOnMount && telegram?.isTelegram) {
        telegram.expand()
      }
    }, [telegram])
    
    if (options?.requireTelegram && !telegram?.isTelegram) {
      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="text-center">
            <h1 className="text-xl font-bold mb-2">Доступ только через Telegram</h1>
            <p className="text-gray-500">Откройте это приложение в Telegram</p>
          </div>
        </div>
      )
    }
    
    return <Component {...props} />
  }
}
