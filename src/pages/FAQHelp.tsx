import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Search, 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Phone, 
  ArrowLeft,
  ExternalLink,
  Star,
  ThumbsUp,
  ThumbsDown,
  Send,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  notHelpful: number;
  tags: string[];
}

interface HelpCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  faqs: FAQItem[];
}

const FAQHelp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [showContactForm, setShowContactForm] = useState(false);

  // FAQ Data - In a real app, this would come from a database
  const [faqData] = useState<HelpCategory[]>([
    {
      id: 'getting-started',
      name: 'Getting Started',
      description: 'Learn how to use ICUPA for the first time',
      icon: <HelpCircle className="w-5 h-5" />,
      faqs: [
        {
          id: 'gs-1',
          question: 'How do I create an account?',
          answer: 'You can start using ICUPA immediately without creating an account. Simply browse bars and restaurants, and when you place an order, you\'ll be prompted to provide your contact information. For a more personalized experience, you can create an account to save favorites and track orders.',
          category: 'getting-started',
          helpful: 45,
          notHelpful: 2,
          tags: ['account', 'registration', 'setup']
        },
        {
          id: 'gs-2',
          question: 'How do I find bars and restaurants near me?',
          answer: 'ICUPA automatically detects your location and shows you nearby establishments. You can also manually search by location, use the search bar to find specific places, or browse by country (Malta or Rwanda).',
          category: 'getting-started',
          helpful: 38,
          notHelpful: 1,
          tags: ['location', 'search', 'nearby']
        },
        {
          id: 'gs-3',
          question: 'Can I use ICUPA without an internet connection?',
          answer: 'ICUPA requires an internet connection to browse menus, place orders, and receive real-time updates. However, you can view previously loaded content for a short time when offline.',
          category: 'getting-started',
          helpful: 29,
          notHelpful: 3,
          tags: ['offline', 'internet', 'connectivity']
        }
      ]
    },
    {
      id: 'ordering',
      name: 'Ordering & Payment',
      description: 'Everything about placing orders and making payments',
      icon: <MessageCircle className="w-5 h-5" />,
      faqs: [
        {
          id: 'order-1',
          question: 'How do I place an order?',
          answer: 'Browse to a bar or restaurant, view their menu, add items to your cart, and proceed to checkout. You\'ll need to provide your contact information and payment details. Once confirmed, your order will be sent to the establishment.',
          category: 'ordering',
          helpful: 67,
          notHelpful: 4,
          tags: ['order', 'checkout', 'payment']
        },
        {
          id: 'order-2',
          question: 'What payment methods are accepted?',
          answer: 'ICUPA accepts various payment methods including credit/debit cards, mobile payments, and digital wallets. The available options may vary by location and establishment.',
          category: 'ordering',
          helpful: 52,
          notHelpful: 2,
          tags: ['payment', 'cards', 'mobile-payment']
        },
        {
          id: 'order-3',
          question: 'Can I cancel or modify my order?',
          answer: 'You can cancel or modify your order within a short time window after placing it. Contact the establishment directly for urgent changes, or use the order tracking feature in the app.',
          category: 'ordering',
          helpful: 41,
          notHelpful: 5,
          tags: ['cancel', 'modify', 'tracking']
        },
        {
          id: 'order-4',
          question: 'How do I track my order?',
          answer: 'After placing an order, you\'ll receive a confirmation with a tracking link. You can also view all your orders in the "Orders" section of your profile to track their status.',
          category: 'ordering',
          helpful: 58,
          notHelpful: 3,
          tags: ['tracking', 'status', 'confirmation']
        }
      ]
    },
    {
      id: 'technical',
      name: 'Technical Support',
      description: 'Troubleshooting and technical issues',
      icon: <AlertCircle className="w-5 h-5" />,
      faqs: [
        {
          id: 'tech-1',
          question: 'The app is not loading properly. What should I do?',
          answer: 'Try refreshing the page, clearing your browser cache, or restarting the app. If the problem persists, check your internet connection or try accessing from a different device.',
          category: 'technical',
          helpful: 34,
          notHelpful: 2,
          tags: ['loading', 'cache', 'refresh']
        },
        {
          id: 'tech-2',
          question: 'I\'m having trouble with payments. What can I do?',
          answer: 'Ensure your payment information is correct and your card is not expired. Try using a different payment method or contact your bank to verify the transaction is not being blocked.',
          category: 'technical',
          helpful: 28,
          notHelpful: 4,
          tags: ['payment', 'card', 'bank']
        },
        {
          id: 'tech-3',
          question: 'How do I update the app?',
          answer: 'ICUPA is a web application that updates automatically. Simply refresh your browser to get the latest version. If you\'re using the mobile app, check your app store for updates.',
          category: 'technical',
          helpful: 22,
          notHelpful: 1,
          tags: ['update', 'version', 'refresh']
        }
      ]
    },
    {
      id: 'account',
      name: 'Account & Privacy',
      description: 'Managing your account and privacy settings',
      icon: <Star className="w-5 h-5" />,
      faqs: [
        {
          id: 'acc-1',
          question: 'How do I change my account settings?',
          answer: 'Go to your profile page and click on "Settings" to modify your preferences, notification settings, privacy options, and other account-related configurations.',
          category: 'account',
          helpful: 31,
          notHelpful: 2,
          tags: ['settings', 'profile', 'preferences']
        },
        {
          id: 'acc-2',
          question: 'How do I delete my account?',
          answer: 'You can delete your account from the settings page. This will permanently remove all your data including order history and preferences. This action cannot be undone.',
          category: 'account',
          helpful: 19,
          notHelpful: 1,
          tags: ['delete', 'account', 'data']
        },
        {
          id: 'acc-3',
          question: 'Is my personal information secure?',
          answer: 'Yes, ICUPA uses industry-standard security measures to protect your personal information. We never share your data with third parties without your explicit consent.',
          category: 'account',
          helpful: 47,
          notHelpful: 3,
          tags: ['security', 'privacy', 'data-protection']
        }
      ]
    }
  ]);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const allFAQs = faqData.flatMap(category => category.faqs);

  const filteredFAQs = allFAQs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleHelpfulVote = (faqId: string, isHelpful: boolean) => {
    // In a real app, this would update the database
    toast({
      title: "Thank you!",
      description: `Your feedback has been recorded.`,
    });
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    // In a real app, this would send the message to a support system
    toast({
      title: "Message Sent",
      description: "We'll get back to you within 24 hours",
    });
    
    setContactForm({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
    setShowContactForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-12 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/client')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Help & FAQ</h1>
                <p className="text-sm text-gray-600">Find answers to common questions</p>
              </div>
            </div>
            
            <Button
              onClick={() => setShowContactForm(true)}
              variant="outline"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
            className="h-auto p-4 flex flex-col items-center gap-2"
          >
            <HelpCircle className="w-6 h-6" />
            <span>All Topics</span>
          </Button>
          
          {faqData.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.id)}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              {category.icon}
              <span>{category.name}</span>
            </Button>
          ))}
        </div>

        {/* FAQ Results */}
        {filteredFAQs.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {searchQuery ? `Search Results for "${searchQuery}"` : 'Frequently Asked Questions'}
              </h2>
              <Badge variant="secondary">{filteredFAQs.length} results</Badge>
            </div>
            
            <Accordion type="single" collapsible className="space-y-4">
              {filteredFAQs.map(faq => (
                <AccordionItem key={faq.id} value={faq.id} className="border rounded-lg">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="text-left">
                      <h3 className="font-medium">{faq.question}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {faqData.find(cat => cat.id === faq.category)?.name}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {faq.helpful} found helpful
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div className="space-y-4">
                      <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Was this helpful?</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleHelpfulVote(faq.id, true)}
                        >
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          Yes
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleHelpfulVote(faq.id, false)}
                        >
                          <ThumbsDown className="w-4 h-4 mr-1" />
                          No
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {faq.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No results found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery 
                  ? `No FAQ items match "${searchQuery}". Try different keywords or browse all categories.`
                  : 'No FAQ items available for this category.'
                }
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                View All FAQs
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Contact Support */}
        {showContactForm && (
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>
                Can't find what you're looking for? Send us a message and we'll help you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="message">Message</Label>
                  <textarea
                    id="message"
                    value={contactForm.message}
                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Please describe your issue in detail..."
                    className="w-full min-h-[120px] p-3 border border-gray-300 rounded-md resize-none"
                    required
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button type="submit">
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowContactForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Additional Help Options */}
        <Card>
          <CardHeader>
            <CardTitle>Other Ways to Get Help</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <Mail className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h4 className="font-medium mb-1">Email Support</h4>
                <p className="text-sm text-gray-600">support@icupa.com</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <Phone className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h4 className="font-medium mb-1">Phone Support</h4>
                <p className="text-sm text-gray-600">+356 1234 5678</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <ExternalLink className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <h4 className="font-medium mb-1">Live Chat</h4>
                <p className="text-sm text-gray-600">Available 24/7</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FAQHelp; 