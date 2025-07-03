import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Bell, 
  Globe,
  ArrowRight,
  Check,
  X,
  AlertCircle,
  Navigation
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface ClientOnboardingProps {
  onComplete: (preferences: {
    country: string;
    location: { latitude: number; longitude: number } | null;
    notificationsEnabled: boolean;
  }) => void;
  onSkip: () => void;
}

const ClientOnboarding: React.FC<ClientOnboardingProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState({
    country: '',
    location: null as { latitude: number; longitude: number } | null,
    notificationsEnabled: false
  });
  const [locationStatus, setLocationStatus] = useState<'pending' | 'granted' | 'denied' | 'unsupported'>('pending');
  const [notificationStatus, setNotificationStatus] = useState<'pending' | 'granted' | 'denied' | 'unsupported'>('pending');
  const { toast } = useToast();

  const steps = [
    {
      id: 'location',
      title: 'Share Your Location 📍',
      description: 'We\'ll show you nearby restaurants and bars in your area',
      icon: <MapPin className="h-12 w-12 text-blue-500" />,
      color: 'bg-blue-500'
    },
    {
      id: 'notifications',
      title: 'Stay Updated 🔔',
      description: 'Get notified about your order status and special offers',
      icon: <Bell className="h-12 w-12 text-green-500" />,
      color: 'bg-green-500'
    },
    {
      id: 'country',
      title: 'Select Your Country 🌍',
      description: 'Choose your location to see relevant restaurants',
      icon: <Globe className="h-12 w-12 text-purple-500" />,
      color: 'bg-purple-500'
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  // Handle location permission
  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setLocationStatus('unsupported');
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support location services",
        variant: "destructive"
      });
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const { latitude, longitude } = position.coords;
      setPreferences(prev => ({ ...prev, location: { latitude, longitude } }));
      setLocationStatus('granted');
      
      // Auto-detect country based on coordinates
      if (latitude > 35 && latitude < 36 && longitude > 14 && longitude < 15) {
        setPreferences(prev => ({ ...prev, country: 'Malta' }));
      } else if (latitude > -3 && latitude < 0 && longitude > 28 && longitude < 32) {
        setPreferences(prev => ({ ...prev, country: 'Rwanda' }));
      }

      toast({
        title: "Location access granted",
        description: "We'll show you nearby restaurants",
      });

    } catch (error) {
      setLocationStatus('denied');
      toast({
        title: "Location access denied",
        description: "You can still browse restaurants by selecting your country",
        variant: "destructive"
      });
    }
  };

  // Handle notification permission
  const requestNotifications = async () => {
    if (!('Notification' in window)) {
      setNotificationStatus('unsupported');
      toast({
        title: "Notifications not supported",
        description: "Your browser doesn't support notifications",
        variant: "destructive"
      });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationStatus('granted');
        setPreferences(prev => ({ ...prev, notificationsEnabled: true }));
        toast({
          title: "Notifications enabled",
          description: "You'll get updates about your orders",
        });
      } else {
        setNotificationStatus('denied');
        toast({
          title: "Notifications denied",
          description: "You can enable them later in settings",
          variant: "destructive"
        });
      }
    } catch (error) {
      setNotificationStatus('denied');
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = () => {
    // Save preferences
    localStorage.setItem('icupa_onboarding_completed', 'true');
    localStorage.setItem('icupa_client_preferences', JSON.stringify(preferences));
    localStorage.setItem('icupa_user_country', preferences.country);
    
    onComplete(preferences);
  };

  const skipOnboarding = () => {
    localStorage.setItem('icupa_onboarding_skipped', 'true');
    localStorage.setItem('icupa_user_country', 'Malta'); // Default
    onSkip();
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Location step
        return locationStatus === 'granted' || locationStatus === 'denied' || locationStatus === 'unsupported';
      case 1: // Notifications step
        return notificationStatus === 'granted' || notificationStatus === 'denied' || notificationStatus === 'unsupported';
      case 2: // Country step
        return preferences.country !== '';
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.id) {
      case 'location':
        return (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              {locationStatus === 'pending' && (
                <Button
                  onClick={requestLocation}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 text-lg"
                >
                  <Navigation className="mr-2 h-5 w-5" />
                  Share Location
                </Button>
              )}
              
              {locationStatus === 'granted' && (
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <Check className="h-6 w-6" />
                  <span className="text-lg font-medium">Location Access Granted</span>
                </div>
              )}
              
              {(locationStatus === 'denied' || locationStatus === 'unsupported') && (
                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-2 text-red-600">
                    <X className="h-6 w-6" />
                    <span className="text-lg font-medium">
                      {locationStatus === 'denied' ? 'Location Access Denied' : 'Location Not Supported'}
                    </span>
                  </div>
                  <p className="text-gray-600">No worries! You can still browse restaurants by country.</p>
                </div>
              )}
            </motion.div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Why we need location access:</p>
                  <ul className="mt-1 space-y-1">
                    <li>• Show nearby restaurants and bars</li>
                    <li>• Estimate delivery times</li>
                    <li>• Provide relevant recommendations</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              {notificationStatus === 'pending' && (
                <Button
                  onClick={requestNotifications}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-lg"
                >
                  <Bell className="mr-2 h-5 w-5" />
                  Enable Notifications
                </Button>
              )}
              
              {notificationStatus === 'granted' && (
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <Check className="h-6 w-6" />
                  <span className="text-lg font-medium">Notifications Enabled</span>
                </div>
              )}
              
              {(notificationStatus === 'denied' || notificationStatus === 'unsupported') && (
                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-2 text-red-600">
                    <X className="h-6 w-6" />
                    <span className="text-lg font-medium">
                      {notificationStatus === 'denied' ? 'Notifications Denied' : 'Notifications Not Supported'}
                    </span>
                  </div>
                  <p className="text-gray-600">You can enable them later in your browser settings.</p>
                </div>
              )}
            </motion.div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Bell className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-medium">Stay informed about:</p>
                  <ul className="mt-1 space-y-1">
                    <li>• Order confirmation and updates</li>
                    <li>• When your food is ready</li>
                    <li>• Special offers and promotions</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'country':
        return (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-3">
                <Button
                  variant={preferences.country === 'Malta' ? 'default' : 'outline'}
                  onClick={() => setPreferences(prev => ({ ...prev, country: 'Malta' }))}
                  className="h-16 text-lg justify-start space-x-3"
                >
                  <span className="text-2xl">🇲🇹</span>
                  <div className="text-left">
                    <div className="font-semibold">Malta</div>
                    <div className="text-sm opacity-70">Mediterranean cuisine & bars</div>
                  </div>
                </Button>
                
                <Button
                  variant={preferences.country === 'Rwanda' ? 'default' : 'outline'}
                  onClick={() => setPreferences(prev => ({ ...prev, country: 'Rwanda' }))}
                  className="h-16 text-lg justify-start space-x-3"
                >
                  <span className="text-2xl">🇷🇼</span>
                  <div className="text-left">
                    <div className="font-semibold">Rwanda</div>
                    <div className="text-sm opacity-70">Local & international cuisine</div>
                  </div>
                </Button>
              </div>
              
              {preferences.location && (
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-sm text-purple-800">
                    📍 Based on your location, we've pre-selected {preferences.country || 'a country'} for you.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-white shadow-2xl overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold">Welcome to ICUPA</h1>
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
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center space-y-6"
              >
                {/* Icon */}
                <div className={`inline-flex p-4 rounded-full ${steps[currentStep].color}/10`}>
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {steps[currentStep].icon}
                  </motion.div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900">
                  {steps[currentStep].title}
                </h2>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed">
                  {steps[currentStep].description}
                </p>

                {/* Step Content */}
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 bg-gray-50 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Previous
            </Button>

            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep
                      ? steps[currentStep].color
                      : index < currentStep
                      ? 'bg-gray-400'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  Start Exploring
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientOnboarding;
