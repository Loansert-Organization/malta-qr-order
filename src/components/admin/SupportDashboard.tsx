
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SupportTicket } from '@/services/icupaProductionSystem';
import { Users, Mail, MessageCircle, CheckCircle, AlertCircle } from 'lucide-react';

const SupportDashboard: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    // Mock data with all required properties
    const mockTickets: SupportTicket[] = [
      {
        id: '1',
        customer_id: 'customer_1',
        subject: 'Payment Issue',
        description: 'Unable to process payment',
        status: 'open',
        priority: 'high',
        category: 'billing',
        assigned_to: 'john_doe',
        vendor_id: 'vendor_1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        customer_id: 'customer_2',
        subject: 'Menu Loading Error',
        description: 'Menu items not displaying correctly',
        status: 'in_progress',
        priority: 'medium',
        category: 'technical',
        assigned_to: 'jane_smith',
        vendor_id: 'vendor_2',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    setTickets(mockTickets);
    setLoading(false);
  };

  const getTicketStatusVariant = (status: string) => {
    switch (status) {
      case 'open':
        return 'destructive';
      case 'in_progress':
        return 'secondary';
      case 'resolved':
        return 'default';
      case 'closed':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Support Dashboard</h1>
            <p className="text-gray-600">Review and respond to support tickets</p>
          </div>
          <Button>
            <Users className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No support tickets found.</div>
        ) : (
          <div className="space-y-4">
            {tickets.map(ticket => (
              <Card key={ticket.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{ticket.subject}</CardTitle>
                    <Badge variant={getTicketStatusVariant(ticket.status)}>
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Priority: {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}</span>
                    <span>Category: {ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)}</span>
                    <span>Assigned to: {ticket.assigned_to || 'Unassigned'}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-2">{ticket.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <Mail className="h-4 w-4" />
                    <span>Customer ID: {ticket.customer_id}</span>
                    <MessageCircle className="h-4 w-4" />
                    <span>Vendor ID: {ticket.vendor_id || 'N/A'}</span>
                    <CheckCircle className="h-4 w-4" />
                    <span>Created: {new Date(ticket.created_at).toLocaleString()}</span>
                    <AlertCircle className="h-4 w-4" />
                    <span>Updated: {new Date(ticket.updated_at).toLocaleString()}</span>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <Button size="sm" variant="outline">View Details</Button>
                    <Button size="sm">Respond</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportDashboard;
