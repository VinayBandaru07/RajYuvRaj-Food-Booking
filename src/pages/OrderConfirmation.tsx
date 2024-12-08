import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Home } from 'lucide-react';

function OrderConfirmation() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Confirmed!</h2>
        <p className="text-gray-600 mb-8">
          Your order has been successfully placed. Our staff will deliver your food to your seat shortly.
        </p>
        <button
          onClick={() => navigate('/menu')}
          className="inline-flex items-center space-x-2 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors duration-300"
        >
          <Home className="w-5 h-5" />
          <span>Return to Menu</span>
        </button>
        <br /><br />
        <div>
  <p style={{ color: 'gray', fontSize: '0.8rem', textAlign:'center' }}>
    Contact our food counter if you have issues about payment or order confirmation, we are always happy to assist.
  </p>
</div>
      </div>
    </div>
  );
}

export default OrderConfirmation;