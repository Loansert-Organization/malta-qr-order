
import toast from 'react-hot-toast';

export function addToast({ 
  title, 
  description, 
  variant = "default" 
}: { 
  title?: string; 
  description?: string; 
  variant?: "default" | "destructive" 
}) {
  const message = title ? (description ? `${title}: ${description}` : title) : description || '';
  
  if (variant === "destructive") {
    return toast.error(message);
  } else {
    return toast.success(message);
  }
}

// Export for backward compatibility
export { addToast as toast };

// Export the Toaster component (this is now handled in App.tsx)
export function Toaster() {
  return null; // No longer needed as component
}
