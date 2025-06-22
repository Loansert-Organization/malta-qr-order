
import toast from 'react-hot-toast';

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const showToast = ({ title, description, variant = "default" }: ToastProps) => {
    const message = title ? (description ? `${title}: ${description}` : title) : description || '';
    
    if (variant === "destructive") {
      return toast.error(message);
    } else {
      return toast.success(message);
    }
  };

  return {
    toast: showToast,
    dismiss: (toastId?: string) => {
      if (toastId) {
        toast.dismiss(toastId);
      } else {
        toast.dismiss();
      }
    }
  };
}

// Export the main toast function for direct usage
export { toast };
