// import React, { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useStore } from '../store/useStore';
// import { useMenuStore } from '../store/menuStore';
// import { Minus, Plus, ArrowLeft, Trash2 } from 'lucide-react';
// import toast from 'react-hot-toast';

// function Cart() {
//   const navigate = useNavigate();
//   const { cart, updateQuantity, removeFromCart } = useStore();
//   const { items: menuItems, startRealTimeUpdates } = useMenuStore();

//   useEffect(() => {
//     const unsubscribe = startRealTimeUpdates();
//     return () => unsubscribe();
//   }, []);

//   // Listen for menu changes and remove out-of-stock items
//   useEffect(() => {
//     cart.forEach(cartItem => {
//       const menuItem = menuItems.find(item => item.id === cartItem.id);
//       if (menuItem && !menuItem.enabled) {
//         removeFromCart(cartItem.id);
//         toast.error(`${cartItem.name} has been removed from your cart as it is now out of stock`);
//       }
//     });
//   }, [menuItems, cart]);

//   const handleQuantityChange = (id: string, currentQuantity: number, change: number) => {
//     const menuItem = menuItems.find(item => item.id === id);
//     if (!menuItem?.enabled) {
//       toast.error('This item is currently out of stock');
//       return;
//     }
    
//     const newQuantity = currentQuantity + change;
//     if (newQuantity < 1) {
//       removeFromCart(id);
//       toast.success('Item removed from cart');
//       return;
//     }
//     updateQuantity(id, newQuantity);
//   };

//   const calculateSubtotal = () => {
//     return cart.reduce((total, item) => {
//       const menuItem = menuItems.find(mi => mi.id === item.id);
//       if (!menuItem?.enabled) return total;
//       return total + item.price * item.quantity;
//     }, 0);
//   };

//   const calculateTaxes = (subtotal: number) => {
//     const sgst = subtotal * 0.025; // 2.5%
//     const cgst = subtotal * 0.025; // 2.5%
//     return { sgst, cgst };
//   };

//   const calculateTotal = () => {
//     const subtotal = calculateSubtotal();
//     const { sgst, cgst } = calculateTaxes(subtotal);
//     const handlingCharges = 4;
//     return subtotal + sgst + cgst + handlingCharges;
//   };

//   const availableItemsCount = cart.filter(item => 
//     menuItems.find(mi => mi.id === item.id)?.enabled
//   ).length;

//   if (cart.length === 0 || availableItemsCount === 0) {
//     return (
//       <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
//         <h2 className="text-2xl font-bold text-gray-900 mb-4">
//           {cart.length === 0 ? 'Your cart is empty' : 'All items in your cart are out of stock'}
//         </h2>
//         <button
//           onClick={() => navigate('/menu')}
//           className="flex items-center space-x-2 text-red-600 hover:text-red-700"
//         >
//           <ArrowLeft className="w-5 h-5" />
//           <span>Return to Menu</span>
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="flex items-center mb-8">
//           <button
//             onClick={() => navigate('/menu')}
//             className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
//           >
//             <ArrowLeft className="w-5 h-5" />
//             <span>Continue Shopping</span>
//           </button>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Cart Items */}
//           <div className="lg:col-span-2">
//             <div className="bg-white rounded-lg  shadow-md overflow-hidden ">
//               <div className="p-4 md:p-6 space-y-4 md:space-y-6 ">
//                 {cart.map((item) => {
//                   const menuItem = menuItems.find(mi => mi.id === item.id);
//                   const isOutOfStock = !menuItem?.enabled;
                  
//                   return (
//                     <div key={item.id} className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
//                       <div className="relative w-full md:w-20 h-20">
//                         <img
//                           src={item.image}
//                           alt={item.name}
//                           className={`w-full h-full object-cover rounded-md ${isOutOfStock ? 'opacity-50' : ''}`}
//                         />
//                         {isOutOfStock && (
//                           <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md">
//                             <span className="text-white text-sm font-medium">Out of Stock</span>
//                           </div>
//                         )}
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <h3 className={`text-lg font-semibold ${isOutOfStock ? 'line-through text-gray-400' : 'text-gray-900'} truncate`}>
//                           {item.name}
//                         </h3>
//                         <p className={`font-medium ${isOutOfStock ? 'text-gray-400' : 'text-red-600'}`}>
//                           ₹{item.price}
//                         </p>
//                       </div>
//                       <div className="flex items-center justify-between md:justify-end space-x-4">
//                         {!isOutOfStock ? (
//                           <div className="flex items-center space-x-2 bg-gray-100 rounded-md p-1">
//                             <button
//                               onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
//                               className="p-1 rounded-full hover:bg-gray-200"
//                             >
//                               <Minus className="w-4 h-4" />
//                             </button>
//                             <span className="w-8 text-center">{item.quantity}</span>
//                             <button
//                               onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
//                               className="p-1 rounded-full hover:bg-gray-200"
//                             >
//                               <Plus className="w-4 h-4" />
//                             </button>
//                           </div>
//                         ) : (
//                           <span className="text-sm text-red-500">Out of Stock</span>
//                         )}
//                         <button
//                           onClick={() => {
//                             removeFromCart(item.id);
//                             toast.success('Item removed from cart');
//                           }}
//                           className="p-2 text-gray-400 hover:text-red-500"
//                         >
//                           <Trash2 className="w-5 h-5" />
//                         </button>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>

//           {/* Order Summary */}
//           <div className="lg:col-span-1">
//             <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
//               <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
//               <div className="space-y-3">
//                 <div className="flex justify-between text-gray-600">
//                   <span>Subtotal</span>
//                   <span>₹{calculateSubtotal().toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between text-gray-600">
//                   <span>SGST (2.5%)</span>
//                   <span>₹{calculateTaxes(calculateSubtotal()).sgst.toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between text-gray-600">
//                   <span>CGST (2.5%)</span>
//                   <span>₹{calculateTaxes(calculateSubtotal()).cgst.toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between text-gray-600">
//                   <span>Handling Charges</span>
//                   <span>₹4.00</span>
//                 </div>
//                 <div className="border-t pt-3 mt-3">
//                   <div className="flex justify-between font-semibold text-lg">
//                     <span>Total</span>
//                     <span>₹{calculateTotal().toFixed(2)}</span>
//                   </div>
//                 </div>
//                 <button
//                   onClick={() => {
//                     if (availableItemsCount > 0) {
//                       navigate('/payment');
//                     } else {
//                       toast.error('No available items to proceed with payment');
//                     }
//                   }}
//                   className="w-full mt-6 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors duration-300"
//                 >
//                   Proceed to Payment
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Cart;






import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useMenuStore } from '../store/menuStore';
import { Minus, Plus, ArrowLeft, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

function Cart() {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart } = useStore();
  const { items: menuItems, startRealTimeUpdates } = useMenuStore();

  useEffect(() => {
    const unsubscribe = startRealTimeUpdates();
    return () => unsubscribe();
  }, []);

  // Listen for menu changes and remove out-of-stock items
  useEffect(() => {
    cart.forEach(cartItem => {
      const menuItem = menuItems.find(item => item.id === cartItem.id);
      if (menuItem && !menuItem.enabled) {
        removeFromCart(cartItem.id);
        toast.error(`${cartItem.name} has been removed from your cart as it is now out of stock`);
      }
    });
  }, [menuItems, cart]);

  const handleQuantityChange = (id: string, currentQuantity: number, change: number) => {
    const menuItem = menuItems.find(item => item.id === id);
    if (!menuItem?.enabled) {
      toast.error('This item is currently out of stock');
      return;
    }
    
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) {
      removeFromCart(id);
      toast.success('Item removed from cart');
      return;
    }
    updateQuantity(id, newQuantity);
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => {
      const menuItem = menuItems.find(mi => mi.id === item.id);
      if (!menuItem?.enabled) return total;
      return total + item.price * item.quantity;
    }, 0);
  };

  const calculateTaxes = (subtotal: number) => {
    const sgst = subtotal * 0; // 2.5%
    const cgst = subtotal * 0; // 2.5%
    const handleCharges = subtotal * 0.040
    return { sgst, cgst, handleCharges };
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const { sgst, cgst, handleCharges } = calculateTaxes(subtotal);
    return subtotal + sgst + cgst + handleCharges;
  };

  const availableItemsCount = cart.filter(item => 
    menuItems.find(mi => mi.id === item.id)?.enabled
  ).length;

  if (cart.length === 0 || availableItemsCount === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {cart.length === 0 ? 'Your cart is empty' : 'All items in your cart are out of stock'}
        </h2>
        <button
          onClick={() => navigate('/menu')}
          className="flex items-center space-x-2 text-red-600 hover:text-red-700"
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
            <span className='text-red-600'>Continue Shopping</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 space-y-6">
                {cart.map((item) => {
                  const menuItem = menuItems.find(mi => mi.id === item.id);
                  const isOutOfStock = !menuItem?.enabled;
                  
                  return (
                    <div key={item.id} className="flex items-center space-x-4 py-2 border-b">
  {/* Image */}
  <div className="w-20 h-20 flex-shrink-0">
    <img
      src={item.image}
      alt={item.name}
      className={`w-full h-full object-cover rounded-md ${isOutOfStock ? 'opacity-50' : ''}`}
    />
  </div>

  {/* Item Details */}
  <div className="flex-1">
    <h3 className={`lg:text-lg md:text-md text-md font-semibold ${isOutOfStock ? 'line-through text-gray-400' : 'text-gray-900'}`}>
      {item.name}
    </h3>
    <p className={`font-medium ${isOutOfStock ? 'text-gray-400' : 'text-red-600'}`}>
      ₹{item.price}
    </p>
  </div>

  {/* Quantity Controls and Trash Icon */}
  <div className="flex items-center space-x-4">
    {!isOutOfStock ? (
      <div className="flex items-center space-x-2 bg-gray-100 rounded-md p-1">
        <button
          onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
          className="p-1 rounded-full hover:bg-gray-200"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-8 text-center font-medium">{item.quantity}</span>
        <button
          onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
          className="p-1 rounded-full hover:bg-gray-200"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    ) : (
      <span className="text-sm text-red-500">Out of Stock</span>
    )}

    {/* Trash Icon */}
    {/* <button
      onClick={() => {
        removeFromCart(item.id);
        toast.success('Item removed from cart');
      }}
      className="p-2 text-gray-400 hover:text-red-500"
    >
      <Trash2 className="w-5 h-5" />
    </button> */}
  </div>
</div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{calculateSubtotal().toFixed(2)}</span>
                </div>
                {/* <div className="flex justify-between text-gray-600">
                  <span>SGST (2.5%)</span>
                  <span>₹{calculateTaxes(calculateSubtotal()).sgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>CGST (2.5%)</span>
                  <span>₹{calculateTaxes(calculateSubtotal()).cgst.toFixed(2)}</span>
                </div> */}
                <div className="flex justify-between text-gray-600">
                  <span>Handling Charges (4%)</span>
                  <span>₹{calculateTaxes(calculateSubtotal()).handleCharges.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₹{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (availableItemsCount > 0) {
                      navigate('/payment');
                    } else {
                      toast.error('No available items to proceed with payment');
                    }
                  }}
                  className="w-full mt-6 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors duration-300"
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