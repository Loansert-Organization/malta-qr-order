// ✨ Modern Loading States & Progress Indicators
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react';

// ========================================
// SKELETON LOADING COMPONENTS
// ========================================

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("animate-pulse", className)}>
    <div className="bg-gray-200 rounded-lg p-4 space-y-3">
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
      <div className="h-8 bg-gray-300 rounded w-full"></div>
    </div>
  </div>
);

export const MenuItemSkeleton: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="animate-pulse"
  >
    <div className="bg-white rounded-lg shadow-sm border p-4 space-y-3">
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="w-20 h-8 bg-gray-200 rounded"></div>
      </div>
    </div>
  </motion.div>
);

export const CartItemSkeleton: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="animate-pulse"
  >
    <div className="flex items-center space-x-3 p-3 border-b">
      <div className="w-12 h-12 bg-gray-200 rounded"></div>
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        <div className="h-2 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="w-16 h-6 bg-gray-200 rounded"></div>
    </div>
  </motion.div>
);

export const BarCardSkeleton: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="animate-pulse"
  >
    <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
      <div className="h-8 bg-gray-200 rounded w-full"></div>
    </div>
  </motion.div>
);

// ========================================
// MODERN LOADING SPINNERS
// ========================================

interface ModernLoadingProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'purple' | 'orange';
  showText?: boolean;
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
}

export const ModernLoading: React.FC<ModernLoadingProps> = ({ 
  text = 'Loading...', 
  size = 'md',
  color = 'blue',
  showText = true,
  variant = 'spinner'
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10', 
    lg: 'w-16 h-16'
  };

  const colorClasses = {
    blue: 'border-blue-500',
    green: 'border-green-500',
    purple: 'border-purple-500',
    orange: 'border-orange-500'
  };

  if (variant === 'spinner') {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <motion.div
          className={cn(
            "border-4 border-gray-200 border-t-transparent rounded-full",
            sizeClasses[size],
            colorClasses[color]
          )}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        {showText && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-gray-600 font-medium"
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={cn("w-3 h-3 rounded-full", `bg-${color}-500`)}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
        {showText && (
          <p className="text-sm text-gray-600 font-medium">{text}</p>
        )}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <motion.div
          className={cn(
            "rounded-full",
            sizeClasses[size],
            `bg-${color}-500`
          )}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity
          }}
        />
        {showText && (
          <p className="text-sm text-gray-600 font-medium">{text}</p>
        )}
      </div>
    );
  }

  // bars variant
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="flex space-x-1">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className={cn("w-1 rounded-full", `bg-${color}-500`)}
            style={{ height: size === 'sm' ? '16px' : size === 'md' ? '24px' : '32px' }}
            animate={{
              scaleY: [1, 2, 1]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.1
            }}
          />
        ))}
      </div>
      {showText && (
        <p className="text-sm text-gray-600 font-medium">{text}</p>
      )}
    </div>
  );
};

// ========================================
// PROGRESS LOADING WITH STEPS
// ========================================

interface ProgressLoadingProps {
  steps: string[];
  currentStep: number;
  progress: number;
  showPercentage?: boolean;
}

export const ProgressLoading: React.FC<ProgressLoadingProps> = ({ 
  steps, 
  currentStep, 
  progress,
  showPercentage = true
}) => (
  <div className="w-full max-w-md mx-auto space-y-6">
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-gray-600">
        <span>Step {currentStep + 1} of {steps.length}</span>
        {showPercentage && <span>{Math.round(progress)}%</span>}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          className="bg-blue-500 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
    
    <div className="space-y-3">
      {steps.map((step, index) => (
        <motion.div
          key={index}
          className={cn(
            "flex items-center space-x-3 p-3 rounded-lg",
            index === currentStep ? "bg-blue-50 border-l-4 border-blue-500" :
            index < currentStep ? "bg-green-50 border-l-4 border-green-500" :
            "bg-gray-50"
          )}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
            index === currentStep ? "bg-blue-500 text-white animate-pulse" :
            index < currentStep ? "bg-green-500 text-white" :
            "bg-gray-300 text-gray-600"
          )}>
            {index < currentStep ? <CheckCircle className="w-4 h-4" /> : index + 1}
          </div>
          <span className={cn(
            "text-sm",
            index === currentStep ? "text-blue-700 font-medium" :
            index < currentStep ? "text-green-700" :
            "text-gray-600"
          )}>
            {step}
          </span>
          {index === currentStep && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-4 h-4 text-blue-500" />
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  </div>
);

// ========================================
// ANIMATED STATES (SUCCESS/ERROR/WARNING)
// ========================================

interface AnimatedStateProps {
  type: 'success' | 'error' | 'warning' | 'loading';
  title: string;
  description?: string;
  onRetry?: () => void;
  action?: React.ReactNode;
}

export const AnimatedState: React.FC<AnimatedStateProps> = ({
  type,
  title,
  description,
  onRetry,
  action
}) => {
  const icons = {
    success: <CheckCircle className="w-16 h-16 text-green-500" />,
    error: <AlertCircle className="w-16 h-16 text-red-500" />,
    warning: <AlertCircle className="w-16 h-16 text-yellow-500" />,
    loading: <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
  };

  const colors = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    loading: 'text-blue-600'
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="text-center space-y-4 p-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        {icons[type]}
      </motion.div>
      
      <div className="space-y-2">
        <h3 className={cn("text-xl font-semibold", colors[type])}>
          {title}
        </h3>
        {description && (
          <p className="text-gray-600 max-w-md mx-auto">{description}</p>
        )}
      </div>

      {(type === 'error' && onRetry) && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="bg-red-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
        >
          Try Again
        </motion.button>
      )}

      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
};

// ========================================
// SPECIALIZED LOADING COMPONENTS
// ========================================

export const PulseLoader: React.FC<{ text?: string; color?: string }> = ({ 
  text = "Updating...", 
  color = "blue" 
}) => (
  <div className="flex items-center space-x-3">
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn("w-2 h-2 rounded-full", `bg-${color}-500`)}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
    <span className="text-sm text-gray-600">{text}</span>
  </div>
);

export const SearchLoading: React.FC<{ query?: string }> = ({ query }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex items-center justify-center space-x-2 text-gray-500 py-8"
  >
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full"
    />
    <span className="text-sm">
      {query ? `Searching for "${query}"...` : 'Searching menus...'}
    </span>
  </motion.div>
);

export const CartUpdateAnimation: React.FC<{ 
  isVisible: boolean; 
  message?: string;
  type?: 'success' | 'error' | 'info';
}> = ({ 
  isVisible, 
  message = 'Added to cart!',
  type = 'success'
}) => {
  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  };

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: -20 }}
          className={cn(
            "fixed bottom-20 right-4 text-white px-4 py-2 rounded-lg shadow-lg z-50",
            bgColors[type]
          )}
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg">{icons[type]}</span>
            <span className="text-sm font-medium">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const OrderStatusLoader: React.FC<{ 
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  estimatedTime?: number;
}> = ({ status, estimatedTime }) => {
  const statusConfig = {
    pending: { label: 'Order Received', color: 'blue', progress: 25 },
    preparing: { label: 'Preparing Your Order', color: 'orange', progress: 50 },
    ready: { label: 'Ready for Pickup!', color: 'green', progress: 75 },
    completed: { label: 'Order Complete', color: 'green', progress: 100 }
  };

  const config = statusConfig[status];

  return (
    <div className="text-center space-y-4">
      <motion.div
        className={cn("w-16 h-16 rounded-full flex items-center justify-center mx-auto", 
          `bg-${config.color}-100 text-${config.color}-600`
        )}
        animate={{
          scale: status === 'preparing' ? [1, 1.1, 1] : 1
        }}
        transition={{
          duration: 2,
          repeat: status === 'preparing' ? Infinity : 0
        }}
      >
        <Clock className="w-8 h-8" />
      </motion.div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{config.label}</h3>
        {estimatedTime && status === 'preparing' && (
          <p className="text-sm text-gray-600">
            Estimated time: {estimatedTime} minutes
          </p>
        )}
      </div>

      <div className="w-full max-w-xs mx-auto">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className={cn("h-2 rounded-full", `bg-${config.color}-500`)}
            initial={{ width: 0 }}
            animate={{ width: `${config.progress}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>
    </div>
  );
};

// ========================================
// LOADING SCREEN OVERLAY
// ========================================

interface LoadingOverlayProps {
  isVisible: boolean;
  title?: string;
  description?: string;
  progress?: number;
  variant?: 'spinner' | 'progress' | 'dots';
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  title = 'Loading...',
  description,
  progress,
  variant = 'spinner'
}) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg p-8 max-w-md mx-4 text-center"
        >
          <ModernLoading variant={variant} />
          <div className="mt-4 space-y-2">
            <h3 className="text-lg font-semibold">{title}</h3>
            {description && (
              <p className="text-sm text-gray-600">{description}</p>
            )}
            {progress !== undefined && (
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <motion.div
                  className="bg-blue-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default {
  SkeletonCard,
  MenuItemSkeleton, 
  CartItemSkeleton,
  BarCardSkeleton,
  ModernLoading,
  ProgressLoading,
  AnimatedState,
  PulseLoader,
  SearchLoading,
  CartUpdateAnimation,
  OrderStatusLoader,
  LoadingOverlay
}; 