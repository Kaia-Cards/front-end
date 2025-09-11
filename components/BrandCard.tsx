import React from 'react';
import { Percent, Package } from 'lucide-react';

interface Brand {
  id: string;
  name: string;
  logo: string;
  category: string;
  country: string;
  description: string;
  discount: number;
  minValue: number;
  maxValue: number;
  available: boolean;
  cardCount: number;
}

interface BrandCardProps {
  brand: Brand;
  selected: boolean;
  onClick: () => void;
}

export default function BrandCard({ brand, selected, onClick }: BrandCardProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border-2 transition-all cursor-pointer hover:shadow-md transform hover:scale-105 ${
        selected ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200'
      } ${!brand.available ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={brand.available ? onClick : undefined}
    >
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <span className="text-4xl">{brand.logo}</span>
          <div className="flex-1">
            <h3 className="text-xl font-bold">{brand.name}</h3>
            <p className="text-sm text-gray-500">{brand.country}</p>
            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mt-1">
              {brand.category}
            </span>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{brand.description}</p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Percent className="h-4 w-4 text-green-600" />
            <span className="font-bold text-green-600">{brand.discount}% OFF</span>
          </div>
          <span className="text-xs text-gray-500">+ 1% cashback</span>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>${brand.minValue} - ${brand.maxValue}</span>
          <div className="flex items-center space-x-1">
            <Package className="h-3 w-3" />
            <span>{brand.cardCount} cards</span>
          </div>
        </div>

        {!brand.available && (
          <div className="mt-3 text-center">
            <span className="inline-block px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full">
              Currently Unavailable
            </span>
          </div>
        )}
      </div>
    </div>
  );
}