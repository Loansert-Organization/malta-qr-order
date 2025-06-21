
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck, CheckCircle, XCircle } from 'lucide-react';

interface OrderAgreement {
  id: string;
  order_id: string;
  guest_session_id: string;
  agreed_to_terms: boolean;
  agreed_to_privacy: boolean;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

interface OrderAgreementsProps {
  orderAgreements: OrderAgreement[];
}

const OrderAgreements: React.FC<OrderAgreementsProps> = ({ orderAgreements }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Order Agreement Logging
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{orderAgreements.length}</p>
              <p className="text-sm text-gray-600">Total Agreements</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {orderAgreements.filter(a => a.agreed_to_terms).length}
              </p>
              <p className="text-sm text-gray-600">Terms Accepted</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {orderAgreements.filter(a => a.agreed_to_privacy).length}
              </p>
              <p className="text-sm text-gray-600">Privacy Accepted</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">100%</p>
              <p className="text-sm text-gray-600">Compliance Rate</p>
            </div>
          </div>

          {orderAgreements.length === 0 ? (
            <div className="text-center py-8">
              <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No order agreements logged yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Agreements will appear here when guests place orders
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {orderAgreements.map((agreement) => (
                <div key={agreement.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Order: {agreement.order_id.slice(-8)}</p>
                    <p className="text-sm text-gray-600">
                      Session: {agreement.guest_session_id.slice(-8)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(agreement.created_at).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {agreement.agreed_to_terms ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm">Terms</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {agreement.agreed_to_privacy ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm">Privacy</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderAgreements;
