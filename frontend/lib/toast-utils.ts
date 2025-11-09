import { toast as sonnerToast } from "sonner"

// Track recent toasts to prevent duplicates
const recentToasts = new Map<string, number>()
const TOAST_COOLDOWN = 3000 // 3 seconds cooldown for same message

function shouldShowToast(message: string): boolean {
  const now = Date.now()
  const lastShown = recentToasts.get(message)
  
  if (lastShown && now - lastShown < TOAST_COOLDOWN) {
    return false // Skip duplicate within cooldown period
  }
  
  recentToasts.set(message, now)
  
  // Clean up old entries (older than cooldown)
  for (const [msg, time] of recentToasts.entries()) {
    if (now - time > TOAST_COOLDOWN) {
      recentToasts.delete(msg)
    }
  }
  
  return true
}

export const toast = {
  success: (message: string, options?: { description?: string }) => {
    const key = `success:${message}:${options?.description || ''}`
    if (shouldShowToast(key)) {
      return sonnerToast.success(message, options)
    }
  },
  
  error: (message: string, options?: { description?: string }) => {
    const key = `error:${message}:${options?.description || ''}`
    if (shouldShowToast(key)) {
      return sonnerToast.error(message, options)
    }
  },
  
  info: (message: string, options?: { description?: string }) => {
    const key = `info:${message}:${options?.description || ''}`
    if (shouldShowToast(key)) {
      return sonnerToast.info(message, options)
    }
  },
  
  warning: (message: string, options?: { description?: string }) => {
    const key = `warning:${message}:${options?.description || ''}`
    if (shouldShowToast(key)) {
      return sonnerToast.warning(message, options)
    }
  },
  
  // Pass through other sonner methods
  promise: sonnerToast.promise,
  loading: sonnerToast.loading,
  custom: sonnerToast.custom,
  message: sonnerToast.message,
  dismiss: sonnerToast.dismiss,
}

