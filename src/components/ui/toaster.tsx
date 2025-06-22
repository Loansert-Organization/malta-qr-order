
import * as React from "react"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

// Ensure React is properly available
if (!React || typeof React.useState !== 'function') {
  console.error('React hooks are not available in toaster component');
}

// Toast interface
interface ToastItem {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: "default" | "destructive"
}

// Safe global state management
class ToastManager {
  private toasts: ToastItem[] = []
  private listeners: Array<(toasts: ToastItem[]) => void> = []

  addToast(toast: { 
    title?: string; 
    description?: string; 
    variant?: "default" | "destructive" 
  }) {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastItem = { ...toast, id }
    
    this.toasts = [newToast, ...this.toasts.slice(0, 4)]
    this.notifyListeners()
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      this.removeToast(id)
    }, 5000)
    
    return id
  }

  removeToast(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id)
    this.notifyListeners()
  }

  subscribe(listener: (toasts: ToastItem[]) => void) {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  getToasts() {
    return this.toasts
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener([...this.toasts])
      } catch (error) {
        console.error('Error notifying toast listener:', error)
      }
    })
  }
}

// Global toast manager instance
const toastManager = new ToastManager()

// Export function to add toasts
export function addToast(toast: { 
  title?: string; 
  description?: string; 
  variant?: "default" | "destructive" 
}) {
  return toastManager.addToast(toast)
}

// Main Toaster component
export function Toaster() {
  // Safe React hooks usage with fallback
  const [toasts, setToasts] = React.useState<ToastItem[]>(() => toastManager.getToasts())

  React.useEffect(() => {
    const unsubscribe = toastManager.subscribe(setToasts)
    return unsubscribe
  }, [])

  // Defensive rendering
  if (!React || !Array.isArray(toasts)) {
    console.warn('Toaster: Invalid state, skipping render')
    return null
  }

  return (
    <ToastProvider>
      {toasts.map((toast) => (
        <Toast key={toast.id} variant={toast.variant}>
          <div className="grid gap-1">
            {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
            {toast.description && (
              <ToastDescription>{toast.description}</ToastDescription>
            )}
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}

// Export for backward compatibility
export { addToast as toast }
