import React, { createContext, useContext, useState } from 'react';
import { Engagement } from '@/types';

interface EngagementContextType {
  currentEngagement: Engagement | null;
  setCurrentEngagement: (engagement: Engagement | null) => void;
}

const EngagementContext = createContext<EngagementContextType | undefined>(undefined);

export function EngagementProvider({ children }: { children: React.ReactNode }) {
  const [currentEngagement, setCurrentEngagement] = useState<Engagement | null>(null);

  const value = {
    currentEngagement,
    setCurrentEngagement,
  };

  return (
    <EngagementContext.Provider value={value}>
      {children}
    </EngagementContext.Provider>
  );
}

export function useEngagement() {
  const context = useContext(EngagementContext);
  if (context === undefined) {
    throw new Error('useEngagement must be used within an EngagementProvider');
  }
  return context;
}