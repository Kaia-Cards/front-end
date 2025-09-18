interface CategoryFilterProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

export const CategoryFilter = ({ categories, selected, onSelect }: CategoryFilterProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
      {categories.map(category => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            selected === category
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
};