import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Popcorn } from 'lucide-react';
import toast from 'react-hot-toast';

function Login() {
  const navigate = useNavigate();
  const setUser = useStore((state) => state.setUser);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    seatNumber: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.seatNumber) {
      toast.error('Please fill in all fields');
      return;
    }
    setUser(formData.name, formData.phone, formData.seatNumber);
    navigate('/menu');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <Popcorn className="w-16 h-16 mx-auto text-purple-600" />
          <h2 className="mt-4 text-3xl font-bold text-gray-900">Movie Food</h2>
          <p className="mt-2 text-gray-600">Sign in to order your snacks</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter your phone number"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Seat Number</label>
            <input
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              value={formData.seatNumber}
              onChange={(e) => setFormData({ ...formData, seatNumber: e.target.value })}
              placeholder="Enter your seat number"
            />
          </div>
          
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Continue to Menu
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;