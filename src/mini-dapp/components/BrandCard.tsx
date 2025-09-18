interface Brand {
  id: string;
  name: string;
  logo: string;
  category: string;
  discount: number;
  available: boolean;
}

interface BrandCardProps {
  brand: Brand;
  onSelect: () => void;
}

export const BrandCard = ({ brand, onSelect }: BrandCardProps) => {
  return (
    <button
      onClick={onSelect}
      className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center gap-3 hover:shadow-md transition-shadow"
      disabled={!brand.available}
    >
      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
        {brand.logo ? (
          <img src={brand.logo} alt={brand.name} className="w-12 h-12 object-contain" />
        ) : (
          <span className="text-2xl">🏪</span>
        )}
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-sm">{brand.name}</h3>
        <p className="text-xs text-gray-500 mt-1">{brand.category}</p>
      </div>
      {brand.discount > 0 && (
        <div className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded">
          {brand.discount}% OFF
        </div>
      )}
      {!brand.available && (
        <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center">
          <span className="text-gray-500 text-sm">Coming Soon</span>
        </div>
      )}
    </button>
  );
};