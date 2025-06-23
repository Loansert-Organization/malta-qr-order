
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  QrCode, 
  RefreshCw, 
  MapPin, 
  Clock,
  Wifi,
  WifiOff,
  Zap,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface QRScanResult {
  vendor_id: string;
  table_id?: string;
  venue_slug: string;
  vendor_info: {
    business_name: string;
    location: string;
    is_open: boolean;
    current_wait_time?: number;
  };
}

interface ScanHistory {
  id: string;
  venue_name: string;
  scanned_at: string;
  venue_slug: string;
}

const EnhancedQRScanner = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<QRScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cameraPermission, setCameraPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [scanSpeed, setScanSpeed] = useState<'normal' | 'fast' | 'slow'>('normal');

  useEffect(() => {
    // Monitor online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load scan history
    loadScanHistory();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      stopScanning();
    };
  }, []);

  const loadScanHistory = () => {
    const history = localStorage.getItem('qr_scan_history');
    if (history) {
      setScanHistory(JSON.parse(history));
    }
  };

  const saveScanToHistory = (result: QRScanResult) => {
    const newHistoryItem: ScanHistory = {
      id: Date.now().toString(),
      venue_name: result.vendor_info.business_name,
      scanned_at: new Date().toISOString(),
      venue_slug: result.venue_slug
    };

    const updatedHistory = [newHistoryItem, ...scanHistory.slice(0, 9)]; // Keep only 10 recent
    setScanHistory(updatedHistory);
    localStorage.setItem('qr_scan_history', JSON.stringify(updatedHistory));
  };

  const startScanning = async () => {
    try {
      setCameraPermission('pending');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsScanning(true);
        setCameraPermission('granted');
        
        // Start QR detection
        startQRDetection();
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      setCameraPermission('denied');
      toast.error('Camera access is required to scan QR codes');
    }
  };

  const stopScanning = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const startQRDetection = () => {
    const detectInterval = scanSpeed === 'fast' ? 100 : scanSpeed === 'slow' ? 500 : 250;
    
    const interval = setInterval(() => {
      if (!isScanning || !videoRef.current || !canvasRef.current) {
        clearInterval(interval);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return;

      // Draw video frame to canvas
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get image data for QR detection
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Simple QR detection simulation (in real app, use a proper QR library)
      detectQRCode(imageData);
    }, detectInterval);
  };

  const detectQRCode = async (imageData: ImageData) => {
    // In a real implementation, you would use a QR code detection library
    // For this demo, we'll simulate QR detection with a mock function
    
    // Simulate QR detection delay
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Mock QR detection result (replace with actual QR detection logic)
    const mockQRData = await simulateQRDetection();
    
    if (mockQRData) {
      handleQRDetected(mockQRData);
    }
  };

  const simulateQRDetection = async (): Promise<string | null> => {
    // This is a mock function - replace with actual QR detection
    // For demo purposes, we'll randomly "detect" a QR code
    if (Math.random() < 0.001) { // Very low chance to simulate detection
      return 'https://icupa.app/venue/demo-restaurant?table=5';
    }
    return null;
  };

  const handleQRDetected = async (qrData: string) => {
    try {
      setIsScanning(false);
      stopScanning();

      // Parse QR code data
      const parsedResult = await parseQRCode(qrData);
      
      if (parsedResult) {
        setScanResult(parsedResult);
        saveScanToHistory(parsedResult);
        
        // Log scan event
        await logScanEvent(parsedResult);
        
        toast.success(`Found ${parsedResult.vendor_info.business_name}!`);
      } else {
        toast.error('Invalid QR code format');
        setIsScanning(true);
        startQRDetection();
      }
    } catch (error) {
      console.error('Error processing QR code:', error);
      toast.error('Failed to process QR code');
      setIsScanning(true);
      startQRDetection();
    }
  };

  const parseQRCode = async (qrData: string): Promise<QRScanResult | null> => {
    try {
      // Extract venue slug and table from URL
      const url = new URL(qrData);
      const pathSegments = url.pathname.split('/');
      const venueSlug = pathSegments[pathSegments.indexOf('venue') + 1];
      const tableId = url.searchParams.get('table');

      if (!venueSlug) return null;

      // Fetch vendor information
      const { data: vendor, error } = await supabase
        .from('vendors')
        .select('id, business_name, location, is_open, current_wait_time')
        .eq('slug', venueSlug)
        .single();

      if (error || !vendor) return null;

      return {
        vendor_id: vendor.id,
        table_id: tableId || undefined,
        venue_slug: venueSlug,
        vendor_info: {
          business_name: vendor.business_name,
          location: vendor.location,
          is_open: vendor.is_open,
          current_wait_time: vendor.current_wait_time
        }
      };
    } catch (error) {
      console.error('Error parsing QR code:', error);
      return null;
    }
  };

  const logScanEvent = async (result: QRScanResult) => {
    try {
      await supabase.from('qr_scan_logs').insert({
        vendor_id: result.vendor_id,
        table_id: result.table_id,
        scanned_at: new Date().toISOString(),
        user_agent: navigator.userAgent,
        is_online: isOnline
      });
    } catch (error) {
      console.error('Error logging scan event:', error);
    }
  };

  const handleViewMenu = () => {
    if (scanResult) {
      const url = `/venue/${scanResult.venue_slug}${scanResult.table_id ? `?table=${scanResult.table_id}` : ''}`;
      navigate(url);
    }
  };

  const handleHistoryItemClick = (item: ScanHistory) => {
    navigate(`/venue/${item.venue_slug}`);
  };

  const retryScanning = () => {
    setScanResult(null);
    startScanning();
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Status Bar */}
      <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
        <div className="flex items-center space-x-2">
          {isOnline ? (
            <Wifi className="h-4 w-4 text-green-600" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-600" />
          )}
          <span className="text-sm font-medium">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Zap className="h-4 w-4 text-blue-600" />
          <select
            value={scanSpeed}
            onChange={(e) => setScanSpeed(e.target.value as any)}
            className="text-xs bg-transparent"
          >
            <option value="slow">Slow</option>
            <option value="normal">Normal</option>
            <option value="fast">Fast</option>
          </select>
        </div>
      </div>

      {/* Main Scanner */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <QrCode className="h-5 w-5" />
            <span>QR Scanner</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!scanResult ? (
            <>
              {/* Camera View */}
              <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
                {isScanning && (
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                    />
                    <canvas
                      ref={canvasRef}
                      className="hidden"
                    />
                    
                    {/* Scanning Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="border-2 border-white border-dashed w-48 h-48 rounded-lg animate-pulse">
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500"></div>
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500"></div>
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500"></div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500"></div>
                      </div>
                    </div>
                  </>
                )}
                
                {!isScanning && (
                  <div className="flex items-center justify-center h-full text-white">
                    <div className="text-center">
                      <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm opacity-75">Camera not active</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Camera Controls */}
              <div className="flex space-x-2">
                {!isScanning ? (
                  <Button
                    onClick={startScanning}
                    disabled={cameraPermission === 'denied'}
                    className="flex-1"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {cameraPermission === 'denied' ? 'Camera Denied' : 'Start Scanning'}
                  </Button>
                ) : (
                  <Button
                    onClick={stopScanning}
                    variant="outline"
                    className="flex-1"
                  >
                    Stop Scanning
                  </Button>
                )}
                
                <Button
                  onClick={retryScanning}
                  variant="outline"
                  size="icon"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              {cameraPermission === 'denied' && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-700">
                    Camera access is required. Please enable it in your browser settings.
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Scan Result */
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QrCode className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold">{scanResult.vendor_info.business_name}</h3>
                <div className="flex items-center justify-center space-x-2 mt-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{scanResult.vendor_info.location}</span>
                </div>
                {scanResult.table_id && (
                  <Badge className="mt-2">Table {scanResult.table_id}</Badge>
                )}
              </div>

              {/* Status Info */}
              <div className="flex items-center justify-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${
                    scanResult.vendor_info.is_open ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span>{scanResult.vendor_info.is_open ? 'Open' : 'Closed'}</span>
                </div>
                
                {scanResult.vendor_info.current_wait_time && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3 text-gray-500" />
                    <span>{scanResult.vendor_info.current_wait_time} min wait</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button
                  onClick={handleViewMenu}
                  disabled={!scanResult.vendor_info.is_open}
                  className="flex-1"
                >
                  View Menu
                </Button>
                <Button
                  onClick={retryScanning}
                  variant="outline"
                  className="flex-1"
                >
                  Scan Again
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Scans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {scanHistory.slice(0, 5).map(item => (
                <div
                  key={item.id}
                  onClick={() => handleHistoryItemClick(item)}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                >
                  <div>
                    <p className="font-medium text-sm">{item.venue_name}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(item.scanned_at).toLocaleDateString()}
                    </p>
                  </div>
                  <QrCode className="h-4 w-4 text-gray-400" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedQRScanner;
