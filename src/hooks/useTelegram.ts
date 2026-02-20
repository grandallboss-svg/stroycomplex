'use client'

import { useState, useCallback, useMemo, useSyncExternalStore } from 'react'

// Типы для Telegram WebApp API
interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
}

interface TelegramThemeParams {
  bg_color?: string
  text_color?: string
  hint_color?: string
  link_color?: string
  button_color?: string
  button_text_color?: string
  secondary_bg_color?: string
}

interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
    user?: TelegramUser
    query_id?: string
    auth_date?: number
    hash?: string
  }
  version: string
  platform: string
  colorScheme: 'light' | 'dark'
  themeParams: TelegramThemeParams
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  headerColor: string
  backgroundColor: string
  isClosingConfirmationEnabled: boolean
  BackButton: {
    isVisible: boolean
    show: () => void
    hide: () => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
  }
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    isProgressVisible: boolean
    setText: (text: string) => void
    show: () => void
    hide: () => void
    enable: () => void
    disable: () => void
    showProgress: (leaveActive?: boolean) => void
    hideProgress: () => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
  }
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
    selectionChanged: () => void
  }
  expand: () => void
  close: () => void
  setHeaderColor: (color: string) => void
  setBackgroundColor: (color: string) => void
  enableClosingConfirmation: () => void
  disableClosingConfirmation: () => void
  showPopup: (params: {
    title?: string
    message: string
    buttons?: Array<{
      id?: string
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'
      text?: string
    }>
  }, callback?: (buttonId: string) => void) => void
  showAlert: (message: string, callback?: () => void) => void
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void
  ready: () => void
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

interface UseTelegramReturn {
  isTelegram: boolean
  webApp: TelegramWebApp | null
  user: TelegramUser | null
  themeParams: TelegramThemeParams | null
  colorScheme: 'light' | 'dark' | null
  platform: string | null
  version: string | null
  expand: () => void
  close: () => void
  showMainButton: (text: string, onClick: () => void) => void
  hideMainButton: () => void
  showBackButton: (onClick: () => void) => void
  hideBackButton: () => void
  haptic: {
    impact: (style?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notification: (type: 'error' | 'success' | 'warning') => void
    selection: () => void
  }
  showAlert: (message: string) => Promise<void>
  showConfirm: (message: string) => Promise<boolean>
}

// Получение Telegram WebApp без subscribe
function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    return window.Telegram.WebApp
  }
  return null
}

// Заглушка для subscribe (Telegram WebApp не меняется динамически)
function subscribeToTelegram(callback: () => void): () => void {
  // Telegram WebApp инициализируется один раз при загрузке
  // Подписка на изменения не требуется
  return () => {}
}

// Snapshot для useSyncExternalStore
function getTelegramSnapshot(): TelegramWebApp | null {
  return getTelegramWebApp()
}

function getServerSnapshot(): TelegramWebApp | null {
  return null
}

export function useTelegram(): UseTelegramReturn {
  // Используем useSyncExternalStore для безопасного доступа к Telegram API
  const webApp = useSyncExternalStore(
    subscribeToTelegram,
    getTelegramSnapshot,
    getServerSnapshot
  )

  const isTelegram = webApp !== null

  // Инициализация Telegram WebApp при первом рендере
  useMemo(() => {
    if (webApp) {
      webApp.ready()
      webApp.expand()
      
      // Устанавливаем CSS переменные для темы Telegram
      if (webApp.themeParams.bg_color) {
        document.documentElement.style.setProperty('--tg-bg-color', webApp.themeParams.bg_color)
      }
      if (webApp.themeParams.text_color) {
        document.documentElement.style.setProperty('--tg-text-color', webApp.themeParams.text_color)
      }
      if (webApp.themeParams.button_color) {
        document.documentElement.style.setProperty('--tg-button-color', webApp.themeParams.button_color)
      }
      if (webApp.themeParams.secondary_bg_color) {
        document.documentElement.style.setProperty('--tg-secondary-bg-color', webApp.themeParams.secondary_bg_color)
      }
    }
  }, [webApp])

  const expand = useCallback(() => {
    webApp?.expand()
  }, [webApp])

  const close = useCallback(() => {
    webApp?.close()
  }, [webApp])

  const showMainButton = useCallback((text: string, onClick: () => void) => {
    if (webApp) {
      webApp.MainButton.setText(text)
      webApp.MainButton.show()
      webApp.MainButton.onClick(onClick)
    }
  }, [webApp])

  const hideMainButton = useCallback(() => {
    webApp?.MainButton.hide()
  }, [webApp])

  const showBackButton = useCallback((onClick: () => void) => {
    if (webApp) {
      webApp.BackButton.show()
      webApp.BackButton.onClick(onClick)
    }
  }, [webApp])

  const hideBackButton = useCallback(() => {
    webApp?.BackButton.hide()
  }, [webApp])

  const haptic = useMemo(() => ({
    impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
      webApp?.HapticFeedback.impactOccurred(style)
    },
    notification: (type: 'error' | 'success' | 'warning') => {
      webApp?.HapticFeedback.notificationOccurred(type)
    },
    selection: () => {
      webApp?.HapticFeedback.selectionChanged()
    }
  }), [webApp])

  const showAlert = useCallback((message: string): Promise<void> => {
    return new Promise((resolve) => {
      if (webApp) {
        webApp.showAlert(message, resolve)
      } else {
        alert(message)
        resolve()
      }
    })
  }, [webApp])

  const showConfirm = useCallback((message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (webApp) {
        webApp.showConfirm(message, resolve)
      } else {
        resolve(confirm(message))
      }
    })
  }, [webApp])

  return {
    isTelegram,
    webApp,
    user: webApp?.initDataUnsafe?.user || null,
    themeParams: webApp?.themeParams || null,
    colorScheme: webApp?.colorScheme || null,
    platform: webApp?.platform || null,
    version: webApp?.version || null,
    expand,
    close,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    haptic,
    showAlert,
    showConfirm,
  }
}

export default useTelegram
