
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  vendor: {
    business_name: string;
  };
  total_amount: number;
  created_at: string;
}

const OrderRating = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [aiServiceRating, setAiServiceRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          created_at,
          vendors!inner(business_name)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;

      const transformedOrder: Order = {
        ...data,
        vendor: {
          business_name: data.vendors.business_name
        }
      };

      setOrder(transformedOrder);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    try {
      setSubmitting(true);

      const { error } = await supabase
        .from('order_feedback')
        .insert({
          order_id: orderId,
          rating,
          ai_service_rating: aiServiceRating,
          feedback_text: feedbackText || null
        });

      if (error) throw error;

      setSubmitted(true);
      toast.success('Thank you for your feedback!');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ value, onChange, label }: { value: number; onChange: (rating: number) => void; label: string }) => (
    <div className="space-y-2">
      <p className="font-medium">{label}</p>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`h-8 w-8 ${
                star <= value
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-4">Your feedback has been submitted successfully.</p>
          <p className="text-sm text-gray-500">Redirecting to home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/order/${orderId}`)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <h1 className="font-semibold">Rate Your Experience</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>How was your experience?</CardTitle>
            {order && (
              <div className="text-sm text-gray-600">
                Order from {order.vendor.business_name} • €{order.total_amount.toFixed(2)}
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <StarRating
              value={rating}
              onChange={setRating}
              label="Overall Experience"
            />

            <StarRating
              value={aiServiceRating}
              onChange={setAiServiceRating}
              label="AI Assistant Service"
            />

            <div className="space-y-2">
              <p className="font-medium">Additional Comments (Optional)</p>
              <Textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Tell us about your experience..."
                rows={4}
              />
            </div>

            <Button
              onClick={handleSubmitRating}
              disabled={!rating || submitting}
              className="w-full"
            >
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderRating;
