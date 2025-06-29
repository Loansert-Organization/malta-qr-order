import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FavoritesCarousel from '@/components/client/FavoritesCarousel';
import RecentOrdersList from '@/components/client/RecentOrdersList';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import LoadingState from '@/components/LoadingState';
import PageTransition from '@/components/PageTransition';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FavoritesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: favs, error: favErr } = await supabase.rpc('get_favorites', { user_id: user.id });
      if (favErr) throw favErr;
      setFavorites(favs || []);

      const { data: orders, error: ordErr } = await supabase
        .from('orders')
        .select('id, created_at, items')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);
      if (ordErr) throw ordErr;
      setRecent(orders || []);
    } catch (error) {
      console.warn('favorites error', error);
      toast({ title: 'Error', description: 'Failed to load favorites' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddFavorite = (itemId: string) => {
    toast({ title: 'Added', description: 'Item added to cart' });
    // We could fetch item and add to cart localStorage similarly to MenuPage logic
  };

  const handleReorder = async (order: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('user_action_logs').insert({
        user_id: user?.id || null,
        action: 'reorder',
        item_ids: order.items.map((i: any) => i.id),
      });
      localStorage.setItem('pendingOrder', JSON.stringify({
        barId: order.bar_id,
        items: order.items,
        subtotal: order.items.reduce((s: number, i: any) => s + i.price * i.quantity, 0),
        barName: '',
        currency: 'EUR',
        country: 'Malta',
      }));
      navigate('/order');
    } catch (error) {
      console.error('reorder error', error);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 pb-10">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/home')} aria-label="Back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Your Favorites</h1>
          </div>
        </header>

        <div className="container mx-auto px-4 mt-6">
          <FavoritesCarousel favorites={favorites} onAdd={handleAddFavorite} />
          <RecentOrdersList orders={recent} onReorder={handleReorder} />
        </div>
      </div>
    </PageTransition>
  );
};

export default FavoritesPage; 