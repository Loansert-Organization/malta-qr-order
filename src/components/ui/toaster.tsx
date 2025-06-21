
import React from "react"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

// Simple toast state management without hooks to avoid the React null issue
let toastState: Array<{
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: "default" | "destructive"
}> = []

let toastListeners: Array<(toasts: typeof toastState) => void> = []

function addToast(toast: { title?: string; description?: string; variant?: "default" | "destructive" }) {
  const id = Date.now().toString()
  const newToast = { ...toast, id }
  toastState = [newToast, ...toastState.slice(0, 4)] // Keep max 5 toasts
  
  toastListeners.forEach(listener => listener(toastState))
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    toastState = toastState.filter(t => t.id !== id)
    toastListeners.forEach(listener => listener(toastState))
  }, 5000)
}

function useSimpleToast() {
  const [toasts, setToasts] = React.useState(toastState)
  
  React.useEffect(() => {
    toastListeners.push(setToasts)
    return () => {
      const index = toastListeners.indexOf(setToasts)
      if (index > -1) {
        toastListeners.splice(index, 1)
      }
    }
  }, [])
  
  return { toasts, toast: addToast }
}

export function Toaster() {
  const { toasts } = useSimpleToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

// Export the simple toast function for use in other components
export { addToast as toast }
