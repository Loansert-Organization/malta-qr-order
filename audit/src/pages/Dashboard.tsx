import React from 'react';

export function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="audit-card">
          <h3 className="font-semibold mb-2">Risk Heat Map</h3>
          <p className="text-gray-600">Risk assessment visualization coming soon...</p>
        </div>
        <div className="audit-card">
          <h3 className="font-semibold mb-2">Materiality Card</h3>
          <p className="text-gray-600">Materiality calculations coming soon...</p>
        </div>
        <div className="audit-card">
          <h3 className="font-semibold mb-2">AI Insight Feed</h3>
          <p className="text-gray-600">AI-powered insights coming soon...</p>
        </div>
      </div>
    </div>
  );
}