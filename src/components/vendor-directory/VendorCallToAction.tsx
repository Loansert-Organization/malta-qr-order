
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const VendorCallToAction: React.FC = () => {
  return (
    <div className="mt-12 text-center bg-blue-50 rounded-lg p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">
        Are you a restaurant owner?
      </h3>
      <p className="text-gray-600 mb-6">
        Join ICUPA Malta and revolutionize your restaurant with AI-powered ordering
      </p>
      <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
        <Link to="/vendor/register">
          Register Your Restaurant
        </Link>
      </Button>
    </div>
  );
};

export default VendorCallToAction;
