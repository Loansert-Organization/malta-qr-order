
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Clock, AlertCircle, CheckCircle, User, Mail, Phone } from 'lucide-react';
import { icupaProductionSystem, type SupportTicket } from '@/services/icupaProductionSystem';

const SupportDashboard: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [newTicketOpen, setNewTicketOpen] = useState(false);

  useEffect(() => {
    const loadTickets = async () => {
      try {
        // In a real implementation, this would load all tickets for admin view
        setTickets([
          {
            id: '1',
            customer_id: 'customer-1',
            subject: 'Payment not processed',
            description: 'My payment was charged but order not confirmed',
            status: 'open',
            priority: 'high',
            category: 'payment',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            customer_id: 'customer-2',
            subject: 'Cannot access menu',
            description: 'QR code scan not working properly',
            status: 'in_progress',
            priority: 'medium',
            category: 'technical',
            assigned_to: 'agent-1',
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);
      } catch (error) {
        console.error('Failed to load tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, []);

  const handleCreateTicket = async (ticketData: any) => {
    try {
      const ticketId = await icupaProductionSystem.getSupport().createTicket(ticketData);
      console.log('Ticket created:', ticketId);
      setNewTicketOpen(false);
      // Reload tickets
    } catch (error) {
      console.error('Failed to create ticket:', error);
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: SupportTicket['status']) => {
    try {
      await icupaProductionSystem.getSupport().updateTicketStatus(ticketId, status);
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId ? { ...ticket, status } : ticket
      ));
    } catch (error) {
      console.error('Failed to update ticket status:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <CheckCircle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading support dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-600 to-blue-700 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Support Dashboard</h1>
              <p className="text-purple-100">Manage customer support tickets and inquiries</p>
            </div>
            <Dialog open={newTicketOpen} onOpenChange={setNewTicketOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  New Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create Support Ticket</DialogTitle>
                  <DialogDescription>
                    Create a new support ticket for customer inquiry
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="subject" className="text-right">
                      Subject
                    </Label>
                    <Input id="subject" className="col-span-3" placeholder="Enter ticket subject" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                      Category
                    </Label>
                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="order">Order</SelectItem>
                        <SelectItem value="payment">Payment</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="priority" className="text-right">
                      Priority
                    </Label>
                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Textarea id="description" className="col-span-3" placeholder="Describe the issue" />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setNewTicketOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => handleCreateTicket({})}>
                    Create Ticket
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="all">All Tickets</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>All Support Tickets</CardTitle>
                    <CardDescription>
                      Manage and respond to customer support requests
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {tickets.map((ticket) => (
                        <div 
                          key={ticket.id}
                          className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge 
                                  variant="outline"
                                  className={`${getPriorityColor(ticket.priority)} text-white`}
                                >
                                  {ticket.priority}
                                </Badge>
                                <Badge variant="outline">
                                  {getStatusIcon(ticket.status)}
                                  <span className="ml-1">{ticket.status}</span>
                                </Badge>
                                <Badge variant="secondary">{ticket.category}</Badge>
                              </div>
                              <h4 className="font-semibold mb-1">{ticket.subject}</h4>
                              <p className="text-gray-600 text-sm line-clamp-2">{ticket.description}</p>
                              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                <span>#{ticket.id.slice(-6)}</span>
                                <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                                {ticket.assigned_to && <span>Assigned to Agent</span>}
                              </div>
                            </div>
                            <div className="flex flex-col space-y-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateTicketStatus(ticket.id, 'in_progress');
                                }}
                              >
                                Assign
                              </Button>
                              <Button 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateTicketStatus(ticket.id, 'resolved');
                                }}
                              >
                                Resolve
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                {selectedTicket ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MessageSquare className="h-5 w-5 mr-2" />
                        Ticket #{selectedTicket.id.slice(-6)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold">{selectedTicket.subject}</h4>
                          <p className="text-gray-600 mt-1">{selectedTicket.description}</p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getPriorityColor(selectedTicket.priority)} text-white`}>
                            {selectedTicket.priority}
                          </Badge>
                          <Badge variant="outline">
                            {getStatusIcon(selectedTicket.status)}
                            <span className="ml-1">{selectedTicket.status}</span>
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <User className="h-4 w-4 mr-2" />
                            <span>Customer ID: {selectedTicket.customer_id}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>Created: {new Date(selectedTicket.created_at).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Update Status</Label>
                          <Select 
                            value={selectedTicket.status}
                            onValueChange={(value) => handleUpdateTicketStatus(selectedTicket.id, value as SupportTicket['status'])}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Add Response</Label>
                          <Textarea placeholder="Type your response..." />
                          <Button size="sm" className="w-full">
                            Send Response
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">Select a ticket to view details</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">24</div>
                  <p className="text-gray-600">Total Tickets</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">92%</div>
                  <p className="text-gray-600">Resolution Rate</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">1.5h</div>
                  <p className="text-gray-600">Avg Response Time</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SupportDashboard;
