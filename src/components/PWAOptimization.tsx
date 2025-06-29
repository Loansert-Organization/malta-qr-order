import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { usePWA } from "@/hooks/usePWA";
import { offlineService } from "@/services/offlineService";
import { AIErrorBoundary } from "@/components/ErrorBoundaries/AIErrorBoundary";
import {
  Smartphone,
  WifiOff,
  Bell,
  Download,
  CheckCircle,
  AlertTriangle,
  Zap,
  Shield,
  Globe,
  Users,
} from "lucide-react";

interface PWAMetrics {
  installRate: number;
  offlineUsage: number;
  pushEngagement: number;
  mobilePerformance: number;
}

interface PWAState {
  notificationsEnabled: boolean;
  offlineMode: boolean;
  data: Record<string, unknown>;
  error: Error | null;
  isLoading: boolean;
}

const PWAOptimization = () => {
  const { isInstalled, isInstallable, isOnline, installApp } = usePWA();
  const [state, setState] = useState<PWAState>({
    notificationsEnabled: false,
    offlineMode: false,
    data: {},
    error: null,
    isLoading: false,
  });

  const handleEnableNotifications = async () => {
    try {
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        setState((prev) => ({
          ...prev,
          notificationsEnabled: permission === "granted",
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error as Error,
      }));
    }
  };

  const handleOfflineModeToggle = async () => {
    try {
      if (!state.offlineMode) {
        await offlineService.init();
        setState((prev) => ({
          ...prev,
          offlineMode: true,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          offlineMode: false,
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error as Error,
        offlineMode: false,
      }));
    }
  };

  const pwaMetrics: PWAMetrics = {
    installRate: 68,
    offlineUsage: 23,
    pushEngagement: 45,
    mobilePerformance: 92,
  };

  const StatusBadge: React.FC<{ enabled: boolean; label: string }> = ({
    enabled,
    label,
  }) => (
    <Badge
      variant={enabled ? "default" : "secondary"}
      aria-label={`${label} status: ${enabled ? "enabled" : "disabled"}`}
    >
      {enabled ? "Yes" : "No"}
    </Badge>
  );

  const MetricCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: number;
  }> = ({ icon, title, value }) => (
    <div className="flex items-center space-x-2">
      {icon}
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        <Progress
          value={value}
          className="h-2"
          aria-label={`${title}: ${value}%`}
        />
      </div>
      <span className="text-sm font-medium">{value}%</span>
    </div>
  );

  const fetchData = async (): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const response = await fetch("https://api.example.com/data");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      setState((prev) => ({
        ...prev,
        data: json,
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error as Error,
        isLoading: false,
      }));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Test change to trigger Cursor review
  const testVar = "test"; // Using var instead of const to trigger review
  console.log(testVar); // Console log to trigger review

  if (state.error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
            Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">{state.error.message}</p>
          <Button
            onClick={() => fetchData()}
            className="mt-4"
            variant="outline"
            size="sm"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <AIErrorBoundary>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Smartphone className="mr-2 h-5 w-5" aria-hidden="true" />
              PWA Status
            </CardTitle>
            <CardDescription>
              Progressive Web App installation and features status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>App Installed</span>
              <StatusBadge enabled={isInstalled} label="App installation" />
            </div>
            <div className="flex items-center justify-between">
              <span>Installable</span>
              <StatusBadge enabled={isInstallable} label="App installability" />
            </div>
            <div className="flex items-center justify-between">
              <span>Online Status</span>
              <Badge
                variant={isOnline ? "default" : "destructive"}
                aria-label={`Network status: ${isOnline ? "online" : "offline"}`}
              >
                {isOnline ? "Online" : "Offline"}
              </Badge>
            </div>
            {isInstallable && !isInstalled && (
              <Button
                onClick={installApp}
                className="w-full"
                aria-label="Install ICUPA App"
              >
                <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                Install ICUPA App
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <WifiOff className="mr-2 h-5 w-5" aria-hidden="true" />
              Offline Capabilities
            </CardTitle>
            <CardDescription>
              Manage offline mode and data synchronization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-medium">Offline Mode</div>
                <div className="text-sm text-muted-foreground">
                  Enable offline functionality
                </div>
              </div>
              <Switch
                checked={state.offlineMode}
                onCheckedChange={handleOfflineModeToggle}
                aria-label="Toggle offline mode"
              />
            </div>
            <div className="space-y-2">
              <MetricCard
                icon={
                  <Globe className="h-4 w-4 text-blue-500" aria-hidden="true" />
                }
                title="Install Rate"
                value={pwaMetrics.installRate}
              />
              <MetricCard
                icon={
                  <WifiOff
                    className="h-4 w-4 text-orange-500"
                    aria-hidden="true"
                  />
                }
                title="Offline Usage"
                value={pwaMetrics.offlineUsage}
              />
              <MetricCard
                icon={
                  <Bell
                    className="h-4 w-4 text-purple-500"
                    aria-hidden="true"
                  />
                }
                title="Push Engagement"
                value={pwaMetrics.pushEngagement}
              />
              <MetricCard
                icon={
                  <Zap className="h-4 w-4 text-green-500" aria-hidden="true" />
                }
                title="Mobile Performance"
                value={pwaMetrics.mobilePerformance}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AIErrorBoundary>
  );
};

export default PWAOptimization;
