
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold text-blue-600">ICUPA Malta</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Anonymous Access Mode
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
