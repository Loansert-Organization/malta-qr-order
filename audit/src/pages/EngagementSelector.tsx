import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Calendar, Building, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEngagement } from '@/hooks/useEngagement';

// Mock data for demo
const mockEngagements = [
  {
    id: '1',
    name: 'ABC Manufacturing Ltd',
    clientId: 'client-1',
    yearEnd: new Date('2024-12-31'),
    partnerUid: 'partner-1',
    status: 'planning' as const,
    materiality: 25000,
    riskAssessment: 'medium' as const,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '2',
    name: 'Malta Hotels Group',
    clientId: 'client-2',
    yearEnd: new Date('2024-12-31'),
    partnerUid: 'partner-1',
    status: 'fieldwork' as const,
    materiality: 150000,
    riskAssessment: 'high' as const,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-15'),
  },
  {
    id: '3',
    name: 'Mediterranean Shipping Co.',
    clientId: 'client-3',
    yearEnd: new Date('2024-12-31'),
    partnerUid: 'partner-1',
    status: 'review' as const,
    materiality: 500000,
    riskAssessment: 'high' as const,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-03-01'),
  },
];

export function EngagementSelector() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { setCurrentEngagement } = useEngagement();

  const filteredEngagements = mockEngagements.filter(engagement =>
    engagement.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectEngagement = (engagement: typeof mockEngagements[0]) => {
    setCurrentEngagement(engagement);
    navigate(`/engagement/${engagement.id}/dashboard`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'fieldwork':
        return 'bg-yellow-100 text-yellow-800';
      case 'review':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Select Engagement
          </h1>
          <p className="text-gray-600">
            Choose an audit engagement to begin working on
          </p>
        </motion.div>

        {/* Search and Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4 mb-8"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search engagements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="audit-input pl-10"
            />
          </div>
          
          <button className="audit-button-primary flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>New Engagement</span>
          </button>
        </motion.div>

        {/* Engagements Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredEngagements.map((engagement, index) => (
            <motion.div
              key={engagement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="audit-card cursor-pointer hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              onClick={() => handleSelectEngagement(engagement)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center">
                    <Building className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {engagement.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Client ID: {engagement.clientId}
                    </p>
                  </div>
                </div>
                
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(engagement.status)}`}>
                  {engagement.status.charAt(0).toUpperCase() + engagement.status.slice(1)}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Year End: {engagement.yearEnd.getFullYear()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>Materiality:</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    €{engagement.materiality?.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Risk Level:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(engagement.riskAssessment || 'medium')}`}>
                    {engagement.riskAssessment?.charAt(0).toUpperCase()}{engagement.riskAssessment?.slice(1)}
                  </span>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>
                    {engagement.status === 'planning' && '25%'}
                    {engagement.status === 'fieldwork' && '65%'}
                    {engagement.status === 'review' && '90%'}
                    {engagement.status === 'completed' && '100%'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: 
                        engagement.status === 'planning' ? '25%' :
                        engagement.status === 'fieldwork' ? '65%' :
                        engagement.status === 'review' ? '90%' :
                        engagement.status === 'completed' ? '100%' : '0%'
                    }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredEngagements.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No engagements found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'Try adjusting your search criteria' : 'Get started by creating your first engagement'}
            </p>
            <button className="audit-button-primary">
              Create New Engagement
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}