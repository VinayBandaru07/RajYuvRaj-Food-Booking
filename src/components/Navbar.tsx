import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, LogOut } from 'lucide-react';
import { useStore } from '../store/useStore';

function Navbar() {
  const navigate = useNavigate();
  const { cart, logout, name } = useStore();
  
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl text-[#fe0002]" style={{fontWeight:'bolder'}}>Raj Yuvraj</h1>
            <img className="w-10 h-auto mx-auto  object-cover mb-4" src="https://media.tenor.com/CLVR-rgpQL8AAAAj/popcorn-joypixels.gif" alt="" />
            {/* <span className="ml-4 text-gray-600">Welcome, {name}</span> */}
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/cart')}
              className="relative p-2 text-gray-600 hover:text-red-600"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;