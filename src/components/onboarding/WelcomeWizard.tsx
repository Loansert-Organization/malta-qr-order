// ✨ Complete First-Time User Onboarding Experience
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Menu as MenuIcon, 
  ShoppingCart, 
  MessageCircle, 
  Smartphone,
  Globe,
  CheckCircle,
  ArrowRight,
  Star,
  Clock,
  DollarSign,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WelcomeStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  animation: string;
  actionText: string;
  highlightColor: string;
}

interface WelcomeWizardProps {
  onComplete: () => void;
  onSkip: () => void;
}

const WelcomeWizard: React.FC<WelcomeWizardProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [userPreferences, setUserPreferences] = useState({
    location: '',
    favoriteFood: '',
    dietaryRestrictions: []
  });

  const steps: WelcomeStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to ICUPA Malta! 🇲🇹',
      description: 'Your AI-powered dining companion for discovering amazing bars and restaurants across Malta',
      icon: <Globe className="h-12 w-12 text-blue-500" />,
      animation: 'bounce',
      actionText: 'Get Started',
      highlightColor: 'bg-blue-500'
    },
    {
      id: 'discover',
      title: 'Discover Nearby Places 📍',
      description: 'Find bars and restaurants near you with our interactive map. We\'ll show you ratings, distance, and special offers',
      icon: <MapPin className="h-12 w-12 text-green-500" />,
      animation: 'pulse',
      actionText: 'Explore Map',
      highlightColor: 'bg-green-500'
    },
    {
      id: 'menu',
      title: 'Browse Rich Menus 📱',
      description: 'View detailed menus with photos, descriptions, prices, and dietary information. Filter by category or search for specific items',
      icon: <MenuIcon className="h-12 w-12 text-purple-500" />,
      animation: 'scale',
      actionText: 'See Menu Demo',
      highlightColor: 'bg-purple-500'
    },
    {
      id: 'order',
      title: 'Easy Ordering & Payment 💳',
      description: 'Add items to cart, customize your order, and pay securely with Revolut or Mobile Money. No queues, no hassle',
      icon: <ShoppingCart className="h-12 w-12 text-orange-500" />,
      animation: 'slide',
      actionText: 'Try Ordering',
      highlightColor: 'bg-orange-500'
    },
    {
      id: 'ai-waiter',
      title: 'Meet Your AI Waiter 🤖',
      description: 'Chat with our intelligent AI assistant for personalized recommendations, dietary advice, and instant ordering help',
      icon: <MessageCircle className="h-12 w-12 text-pink-500" />,
      animation: 'float',
      actionText: 'Chat with AI',
      highlightColor: 'bg-pink-500'
    },
    {
      id: 'features',
      title: 'Premium Features ⭐',
      description: 'Enjoy offline menus, push notifications, real-time order tracking, and exclusive member discounts',
      icon: <Star className="h-12 w-12 text-yellow-500" />,
      animation: 'glow',
      actionText: 'Unlock Features',
      highlightColor: 'bg-yellow-500'
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 300);
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const completeOnboarding = () => {
    // Save user preferences and mark onboarding as complete
    localStorage.setItem('icupa_onboarding_completed', 'true');
    localStorage.setItem('icupa_user_preferences', JSON.stringify(userPreferences));
    onComplete();
  };

  const skipOnboarding = () => {
    localStorage.setItem('icupa_onboarding_skipped', 'true');
    onSkip();
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentStep < steps.length - 1) {
        nextStep();
      } else if (e.key === 'ArrowLeft' && currentStep > 0) {
        prevStep();
      } else if (e.key === 'Escape') {
        skipOnboarding();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentStep]);

  const getAnimationClass = (animation: string) => {
    const animations = {
      bounce: 'animate-bounce',
      pulse: 'animate-pulse', 
      scale: 'animate-ping',
      slide: 'animate-slide-in-up',
      float: 'animate-float',
      glow: 'animate-glow'
    };
    return animations[animation as keyof typeof animations] || '';
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white shadow-2xl overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">Welcome to ICUPA</h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={skipOnboarding}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4 mr-1" />
                Skip
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Step {currentStep + 1} of {steps.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="w-full bg-white/20" />
            </div>
          </div>

          {/* Step Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="text-center space-y-6"
              >
                {/* Icon */}
                <div className={`inline-flex p-4 rounded-full ${currentStepData.highlightColor}/10`}>
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: currentStepData.animation === 'bounce' ? [0, 5, -5, 0] : 0
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    {currentStepData.icon}
                  </motion.div>
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {currentStepData.title}
                </h2>

                {/* Description */}
                <p className="text-lg text-gray-600 max-w-lg mx-auto leading-relaxed">
                  {currentStepData.description}
                </p>

                {/* Interactive Elements Based on Step */}
                {currentStepData.id === 'welcome' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="grid grid-cols-3 gap-4 mt-6"
                  >
                    <div className="text-center">
                      <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <p className="text-sm font-medium">Fast Service</p>
                      <p className="text-xs text-gray-500">Average 15 min</p>
                    </div>
                    <div className="text-center">
                      <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="text-sm font-medium">Best Prices</p>
                      <p className="text-xs text-gray-500">No hidden fees</p>
                    </div>
                    <div className="text-center">
                      <Smartphone className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                      <p className="text-sm font-medium">Mobile First</p>
                      <p className="text-xs text-gray-500">Works offline</p>
                    </div>
                  </motion.div>
                )}

                {currentStepData.id === 'discover' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gray-50 rounded-lg p-4 mt-6"
                  >
                    <div className="flex items-center justify-center space-x-4">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-700">📍 Your Location</span>
                      <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">🍽️ Nearby Restaurant</span>
                    </div>
                  </motion.div>
                )}

                {currentStepData.id === 'ai-waiter' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gray-50 rounded-lg p-4 mt-6"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <MessageCircle className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm text-gray-800">
                          "Hi! I'm Kai, your AI waiter. I can help you find the perfect meal based on your preferences, dietary needs, or mood. What are you in the mood for today?"
                        </p>
                        <p className="text-xs text-gray-500 mt-1">AI Waiter • Just now</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStepData.id === 'features' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="grid grid-cols-2 gap-4 mt-6"
                  >
                    {[
                      { name: 'Offline Menus', desc: 'Browse when offline', icon: '📱' },
                      { name: 'Push Notifications', desc: 'Order status updates', icon: '🔔' },
                      { name: 'Real-time Tracking', desc: 'Live order progress', icon: '📍' },
                      { name: 'Member Discounts', desc: 'Exclusive offers', icon: '🎁' }
                    ].map((feature, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + idx * 0.1 }}
                        className="bg-gray-50 rounded-lg p-3 text-left"
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-lg">{feature.icon}</span>
                          <p className="text-sm font-medium">{feature.name}</p>
                        </div>
                        <p className="text-xs text-gray-600">{feature.desc}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* Step Indicators */}
                <div className="flex justify-center space-x-2 mt-8">
                  {steps.map((_, index) => (
                    <motion.div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
                        index === currentStep
                          ? currentStepData.highlightColor
                          : index < currentStep
                          ? 'bg-gray-400'
                          : 'bg-gray-200'
                      }`}
                      whileHover={{ scale: 1.2 }}
                      onClick={() => setCurrentStep(index)}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 bg-gray-50 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center space-x-2"
            >
              <span>Previous</span>
            </Button>

            <div className="text-center text-sm text-gray-500">
              <p>Use arrow keys or swipe to navigate</p>
            </div>

            <Button
              onClick={nextStep}
              className={`${currentStepData.highlightColor} hover:opacity-90 flex items-center space-x-2 text-white`}
            >
              <span>
                {currentStep === steps.length - 1 ? 'Start Exploring' : currentStepData.actionText}
              </span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeWizard; 