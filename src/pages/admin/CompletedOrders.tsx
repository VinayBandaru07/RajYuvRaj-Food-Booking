import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Printer } from 'lucide-react';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  customerName: string;
  customerPhone: string;
  seatNumber: string;
  status: string;
  createdAt: string;
  completedAt: string;
}

function CompletedOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchCompletedOrders();
  }, []);

  const fetchCompletedOrders = async () => {
    try {
      const q = query(
        collection(db, 'orders'),
        where('status', '==', 'completed')
      );
      const querySnapshot = await getDocs(q);
      const fetchedOrders: Order[] = [];
      querySnapshot.forEach((doc) => {
        fetchedOrders.push({ id: doc.id, ...doc.data() } as Order);
      });
      setOrders(fetchedOrders.sort((a, b) => 
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      ));
    } catch (error) {
      toast.error('Failed to fetch completed orders');
    }
  };

  const handlePrint = (order: Order) => {
    const printContent = `
      Order Details:
      Customer: ${order.customerName}
      Seat: ${order.seatNumber}
      Phone: ${order.customerPhone}
      
      Items:
      ${order.items.map(item => `${item.name} x${item.quantity} - ₹${item.price * item.quantity}`).join('\n')}
      
      Total: ₹${order.total}
      Completed At: ${new Date(order.completedAt).toLocaleString()}
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`<pre>${printContent}</pre>`);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Completed Orders</h2>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {order.customerName}
                </h3>
                <p className="text-sm text-gray-500">Seat: {order.seatNumber}</p>
                <p className="text-sm text-gray-500">
                  Completed: {new Date(order.completedAt).toLocaleString()}
                </p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Completed
              </span>
            </div>
            
            <div className="border-t border-b py-4 my-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Order Items:</h4>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.name} x{item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>₹{order.total}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => handlePrint(order)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </button>
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No completed orders</p>
        </div>
      )}
    </div>
  );
}

export default CompletedOrders;