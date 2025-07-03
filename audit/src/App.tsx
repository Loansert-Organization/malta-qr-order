import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { EngagementProvider } from '@/hooks/useEngagement';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Layout } from '@/components/layout/Layout';

// Pages
import { LoginPage } from '@/pages/LoginPage';
import { EngagementSelector } from '@/pages/EngagementSelector';
import { Dashboard } from '@/pages/Dashboard';
import { PlanningHub } from '@/pages/PlanningHub';
import { FieldworkBoard } from '@/pages/FieldworkBoard';
import { EvidenceHub } from '@/pages/EvidenceHub';
import { ExceptionsExplorer } from '@/pages/ExceptionsExplorer';
import { ReportingStudio } from '@/pages/ReportingStudio';
import { QualityControlCentre } from '@/pages/QualityControlCentre';

// React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <EngagementProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/engagements" replace />} />
          <Route path="/engagements" element={<EngagementSelector />} />
          <Route path="/engagement/:id">
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="planning" element={<PlanningHub />} />
            <Route path="fieldwork" element={<FieldworkBoard />} />
            <Route path="evidence" element={<EvidenceHub />} />
            <Route path="exceptions" element={<ExceptionsExplorer />} />
            <Route path="reporting" element={<ReportingStudio />} />
            <Route path="quality" element={<QualityControlCentre />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>
          <Route path="*" element={<Navigate to="/engagements" replace />} />
        </Routes>
      </Layout>
    </EngagementProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router basename="/audit">
          <div className="min-h-screen bg-background font-sans antialiased">
            <AppRoutes />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'hsl(var(--card))',
                  color: 'hsl(var(--card-foreground))',
                  border: '1px solid hsl(var(--border))',
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}