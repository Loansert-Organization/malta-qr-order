
// Native browser notification system to replace toast
export const useNativeNotifications = () => {
  const showNotification = (title: string, description?: string, type: 'success' | 'error' | 'info' = 'info') => {
    // Use browser's native notification if available
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: description,
        icon: type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'
      });
    } else {
      // Fallback to console logging and alert for critical errors
      const message = description ? `${title}: ${description}` : title;
      console.log(`[${type.toUpperCase()}]`, message);
      
      if (type === 'error') {
        alert(`Error: ${message}`);
      }
    }
  };

  const requestPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  return {
    showNotification,
    requestPermission,
    toast: showNotification // Compatibility alias
  };
};
