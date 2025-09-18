import { useState, useEffect } from 'react';
import { useLiff } from '../hooks/useLiff';
import { BrandCard } from '../components/BrandCard';
import { CategoryFilter } from '../components/CategoryFilter';
import { SearchBar } from '../components/SearchBar';
import { LoginPrompt } from '../components/LoginPrompt';

interface Brand {
  id: string;
  name: string;
  logo: string;
  category: string;
  discount: number;
  available: boolean;
}

interface HomePageProps {
  navigate: (page: any, data?: any) => void;
}

export const HomePage = ({ navigate }: HomePageProps) => {
  const { isLoggedIn, login } = useLiff();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    filterBrands();
  }, [brands, selectedCategory, searchQuery]);

  const fetchBrands = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/brands`);
      const data = await response.json();
      setBrands(data);
      setFilteredBrands(data);
    } catch (error) {
      console.error('Failed to fetch brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBrands = () => {
    let filtered = brands;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(brand => brand.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(brand =>
        brand.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredBrands(filtered);
  };

  const categories = ['All', ...new Set(brands.map(b => b.category))];

  if (!isLoggedIn) {
    return <LoginPrompt onLogin={login} />;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="p-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-2 gap-4">
            {filteredBrands.map(brand => (
              <BrandCard
                key={brand.id}
                brand={brand}
                onSelect={() => navigate('brand', { selectedBrand: brand })}
              />
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex justify-around">
          <button className="flex flex-col items-center gap-1 text-blue-500">
            <span className="text-xl">🏪</span>
            <span className="text-xs font-medium">Shop</span>
          </button>
          <button
            onClick={() => navigate('orders')}
            className="flex flex-col items-center gap-1 text-gray-500"
          >
            <span className="text-xl">📦</span>
            <span className="text-xs">Orders</span>
          </button>
          <button
            onClick={() => navigate('profile')}
            className="flex flex-col items-center gap-1 text-gray-500"
          >
            <span className="text-xl">👤</span>
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};