import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useMenuStore } from '../store/menuStore';
import { Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from '../components/Navbar';
import CategoryBar from '../components/CategoryBar';

function Menu() {
  const navigate = useNavigate();
  const { items, loading, error, startRealTimeUpdates } = useMenuStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const { cart, addToCart, updateQuantity, removeFromCart } = useStore();

  useEffect(() => {
    const unsubscribe = startRealTimeUpdates();
    return () => unsubscribe();
  }, []);

  const categories = React.useMemo(() => {
    const categoryMap = new Map<string, Set<string>>();
    items.forEach(item => {
      if (!categoryMap.has(item.category)) {
        categoryMap.set(item.category, new Set());
      }
      if (item.subcategory) {
        categoryMap.get(item.category)?.add(item.subcategory);
      }
    });

    return [
      { main: 'all', subcategories: [] },
      ...Array.from(categoryMap.entries()).map(([main, subs]) => ({
        main,
        subcategories: Array.from(subs)
      }))
    ];
  }, [items]);

  const filteredAndSortedItems = React.useMemo(() => {
    const filtered = items.filter(item => {
      if (selectedCategory === 'all') return true;
      if (item.category !== selectedCategory) return false;
      if (selectedSubcategory === 'all') return true;
      return item.subcategory === selectedSubcategory;
    });

    // Sort enabled items first, then by category and name
    return filtered.sort((a, b) => {
      if (a.enabled !== b.enabled) return a.enabled ? -1 : 1;
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      return a.name.localeCompare(b.name);
    });
  }, [items, selectedCategory, selectedSubcategory]);

  const getItemQuantity = (itemId: string) => {
    const cartItem = cart.find(item => item.id === itemId);
    return cartItem?.quantity || 0;
  };

  const handleQuantityChange = (item: any, change: number) => {
    if (!item.enabled) {
      toast.error(`${item.name} is currently out of stock`);
      return;
    }

    const currentQuantity = getItemQuantity(item.id);
    const newQuantity = currentQuantity + change;

    if (newQuantity === 0) {
      removeFromCart(item.id);
      toast.success(`${item.name} removed from cart`);
    } else if (currentQuantity === 0) {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        image: item.image
      });
      toast.success(`${item.name} added to cart`);
    } else {
      updateQuantity(item.id, newQuantity);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <CategoryBar
        categories={categories}
        selectedCategory={selectedCategory}
        selectedSubcategory={selectedSubcategory}
        onCategoryChange={setSelectedCategory}
        onSubcategoryChange={setSelectedSubcategory}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 ${
                !item.enabled ? 'opacity-75' : ''
              }`}
            >
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
                {!item.enabled && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-medium">Out of Stock</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                {item.description && (
                  <p className="mt-1 text-gray-600 text-sm">{item.description}</p>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-purple-600 font-bold">₹{item.price}</span>
                  {!item.enabled ? (
                    <span className="text-red-500 font-medium">Out of Stock</span>
                  ) : getItemQuantity(item.id) === 0 ? (
                    <button
                      onClick={() => handleQuantityChange(item, 1)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-300"
                    >
                      Add to Cart
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2 bg-purple-100 rounded-md p-1">
                      <button
                        onClick={() => handleQuantityChange(item, -1)}
                        className="p-1 rounded-full hover:bg-purple-200"
                      >
                        <Minus className="w-4 h-4 text-purple-600" />
                      </button>
                      <span className="w-8 text-center text-purple-600 font-medium">
                        {getItemQuantity(item.id)}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item, 1)}
                        className="p-1 rounded-full hover:bg-purple-200"
                      >
                        <Plus className="w-4 h-4 text-purple-600" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAndSortedItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No items found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Menu;