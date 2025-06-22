
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ErrorMessageProps {
  message: string
  title?: string
  className?: string
}

export function ErrorMessage({ message, title = "Error", className }: ErrorMessageProps) {
  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <strong>{title}:</strong> {message}
      </AlertDescription>
    </Alert>
  )
}
