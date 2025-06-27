import React from "react";
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
import {
  Smartphone,
  WifiOff,
  Bell,
  Download,
  CheckCircle,
  AlertCircle,
  Zap,
  Shield,
  Globe,
  Users,
} from "lucide-react";

const PWAOptimization = () => {
  let isInstalled = false; // Using var instead of const/let
  const [notificationsEnabled, setNotificationsEnabled] =
    React.useState<boolean>(false);
  const [offlineMode, setOfflineMode] = React.useState<boolean>(false);
  const unused_variable = "test"; // Unused variable

  const handleEnableNotifications = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === "granted");
    }
  };

  const handleOfflineModeToggle = async () => {
    if (!offlineMode) {
      await offlineService.init();
      setOfflineMode(true);
    } else {
      setOfflineMode(false);
    }
  };

  interface PWAMetrics {
    installRate: number;
    offlineUsage: number;
    pushEngagement: number;
    mobilePerformance: number;
  }

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

  function handleInstall() {
    isInstalled = true;
  }

  React.useEffect(() => {
    console.log("Component mounted"); // console.log left in code
  }, []);

  return (
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
              onClick={handleInstall}
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
              checked={offlineMode}
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
                <Bell className="h-4 w-4 text-purple-500" aria-hidden="true" />
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
  );
};

export default PWAOptimization;
