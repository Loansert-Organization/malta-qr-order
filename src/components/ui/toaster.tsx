
import React from "react"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

// Global toast state to avoid React hook issues
let globalToasts: Array<{
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: "default" | "destructive"
}> = []

let updateFunctions: Array<React.Dispatch<React.SetStateAction<any[]>>> = []

export function addToast(toast: { 
  title?: string; 
  description?: string; 
  variant?: "default" | "destructive" 
}) {
  const id = Math.random().toString(36).substr(2, 9)
  const newToast = { ...toast, id }
  
  globalToasts = [newToast, ...globalToasts.slice(0, 4)]
  
  // Update all registered components
  updateFunctions.forEach(update => update([...globalToasts]))
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    globalToasts = globalToasts.filter(t => t.id !== id)
    updateFunctions.forEach(update => update([...globalToasts]))
  }, 5000)
}

export function Toaster() {
  const [toasts, setToasts] = React.useState(globalToasts)

  React.useEffect(() => {
    updateFunctions.push(setToasts)
    return () => {
      const index = updateFunctions.indexOf(setToasts)
      if (index > -1) {
        updateFunctions.splice(index, 1)
      }
    }
  }, [])

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
