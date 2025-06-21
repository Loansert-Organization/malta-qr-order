
import React from 'react';

interface Vendor {
  id: string;
  name: string;
  slug: string;
  location: string;
  description: string;
}

interface VendorHeaderProps {
  vendor: Vendor;
}

const VendorHeader: React.FC<VendorHeaderProps> = ({ vendor }) => {
  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">{vendor.name}</h1>
          <p className="text-gray-600 mt-2">{vendor.location}</p>
          <p className="text-sm text-gray-500 mt-1">{vendor.description}</p>
        </div>
      </div>
    </div>
  );
};

export default VendorHeader;
