
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ConsolidatedSessionProvider } from '@/providers/ConsolidatedSessionProvider';
import DynamicHeroSection from '@/components/DynamicHeroSection';
import SmartMenu from '@/components/SmartMenu';
import AIWaiterButton from '@/components/AIWaiterButton';
import MaltaAIWaiterChat from '@/components/ai-waiter/MaltaAIWaiterChat';
import { useToast } from '@/hooks/use-toast';

const ClientOrder = () => {
  const { vendorSlug } = useParams();
  const { toast } = useToast();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAIChat, setShowAIChat] = useState(false);

  useEffect(() => {
    const fetchVendor = async () => {
      if (!vendorSlug) return;

      try {
        // Try to find vendor by slug, fallback to name
        let { data: vendor, error } = await supabase
          .from('vendors')
          .select('*')
          .eq('slug', vendorSlug)
          .eq('active', true)
          .single();

        if (!vendor) {
          // Fallback: try to find by business_name or create demo vendor
          const { data: fallbackVendor } = await supabase
            .from('vendors')
            .select('*')
            .eq('active', true)
            .limit(1);

          if (fallbackVendor && fallbackVendor.length > 0) {
            vendor = fallbackVendor[0];
          } else {
            // Create demo vendor for testing
            const { data: newVendor, error: createError } = await supabase
              .from('vendors')
              .insert({
                business_name: 'Demo Restaurant',
                name: 'Demo Restaurant', // Keep both for compatibility
                slug: 'demo-restaurant',
                description: 'Experience ICUPA\'s AI-powered ordering system',
                location: 'Valletta, Malta',
                active: true,
                is_active: true
              })
              .select()
              .single();

            if (newVendor) {
              vendor = newVendor;
              // Create demo menu
              await createDemoMenu(newVendor.id);
            }
          }
        }

        if (vendor) {
          setVendor(vendor);
        } else {
          toast({
            title: "Venue Not Found",
            description: "The requested venue could not be found.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error fetching vendor:', error);
        toast({
          title: "Error",
          description: "Failed to load venue information.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVendor();
  }, [vendorSlug, toast]);

  const createDemoMenu = async (vendorId: string) => {
    try {
      // Create menu
      const { data: menu } = await supabase
        .from('menus')
        .insert({
          vendor_id: vendorId,
          name: 'Main Menu',
          active: true
        })
        .select()
        .single();

      if (menu) {
        // Create demo menu items
        const demoItems = [
          {
            menu_id: menu.id,
            name: 'Maltese Ftira',
            description: 'Traditional Maltese sourdough bread with tomatoes, olives, and local cheese',
            price: 8.50,
            category: 'starters',
            available: true,
            popular: true
          },
          {
            menu_id: menu.id,
            name: 'Bragioli',
            description: 'Traditional Maltese beef olives stuffed with breadcrumbs, bacon, and herbs',
            price: 18.50,
            category: 'mains',
            available: true,
            popular: true
          },
          {
            menu_id: menu.id,
            name: 'Kinnie & Cisk',
            description: 'Malta\'s national soft drink paired with local beer',
            price: 6.50,
            category: 'drinks',
            available: true,
            popular: true
          }
        ];

        await supabase.from('menu_items').insert(demoItems);
      }
    } catch (error) {
      console.error('Error creating demo menu:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl">Loading venue...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Venue Not Found</h1>
          <p>The requested venue could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <ConsolidatedSessionProvider vendorId={vendor.id}>
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto">
          <DynamicHeroSection vendor={vendor} />
          
          <div className="p-4">
            <SmartMenu vendorId={vendor.id} />
          </div>

          {/* AI Waiter Button */}
          <AIWaiterButton onClick={() => setShowAIChat(true)} />

          {/* Malta AI Waiter Chat */}
          {showAIChat && (
            <MaltaAIWaiterChat
              vendor={vendor}
              onClose={() => setShowAIChat(false)}
              guestSessionId="anonymous-guest"
            />
          )}
        </div>
      </div>
    </ConsolidatedSessionProvider>
  );
};

export default ClientOrder;
