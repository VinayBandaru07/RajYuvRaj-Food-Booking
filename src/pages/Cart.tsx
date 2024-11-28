import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Minus, Plus, ArrowLeft, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

function Cart() {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart } = useStore();

  const handleQuantityChange = (id: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) {
      removeFromCart(id);
      toast.success('Item removed from cart');
      return;
    }
    updateQuantity(id, newQuantity);
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const calculateTaxes = (subtotal: number) => {
    const sgst = subtotal * 0.025; // 2.5%
    const cgst = subtotal * 0.025; // 2.5%
    return { sgst, cgst };
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const { sgst, cgst } = calculateTaxes(subtotal);
    const handlingCharges = 4;
    return subtotal + sgst + cgst + handlingCharges;
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <button
          onClick={() => navigate('/menu')}
          className="flex items-center space-x-2 text-purple-600 hover:text-purple-700"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Return to Menu</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/menu')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Continue Shopping</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 space-y-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-purple-600 font-medium">₹{item.price}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        removeFromCart(item.id);
                        toast.success('Item removed from cart');
                      }}
                      className="p-2 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>SGST (2.5%)</span>
                  <span>₹{calculateTaxes(calculateSubtotal()).sgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>CGST (2.5%)</span>
                  <span>₹{calculateTaxes(calculateSubtotal()).cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Handling Charges</span>
                  <span>₹4.00</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₹{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/payment')}
                  className="w-full mt-6 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors duration-300"
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;