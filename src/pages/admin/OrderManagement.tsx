import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Printer, CheckCircle, XCircle } from 'lucide-react';
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
  screen: string
}

function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const q = query(
        collection(db, 'orders'),
        where('status', '==', 'pending')
      );
      const querySnapshot = await getDocs(q);
      const fetchedOrders: Order[] = [];
      querySnapshot.forEach((doc) => {
        fetchedOrders.push({ id: doc.id, ...doc.data() } as Order);
      });
      setOrders(fetchedOrders.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      toast.error('Failed to fetch orders');
    }
  };

  const handlePrint = (order: Order) => {
    const printContent = `
      Customer Copy
      G3 CINEMA
    ------------------
      Order Details:
      Customer: ${order.customerName}
      Seat: ${order.seatNumber}
      Screen: ${order.screen}
      Phone: ${order.customerPhone}
      
      Items:
      ${order.items.map(item => `${item.name} x${item.quantity} - ₹${item.price * item.quantity}`).join('\n')}

      SGST: 
      CGST:
      Handling charges:
      
      Total: ₹${order.total}
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`<pre>${printContent}</pre>`);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const updateOrderStatus = async (orderId: string, status: 'completed' | 'not_done') => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status,
        completedAt: new Date().toISOString(),
        completionStatus: status === 'completed' ? 'success' : 'failed'
      });
      toast.success(`Order marked as ${status === 'completed' ? 'completed' : 'not done'}`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Active Orders</h2>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {order.customerName}
                </h3>
                <p className="text-sm text-gray-500">Seat: {order.seatNumber}</p>
                <p className="text-sm text-gray-500">Screen: {order.screen}</p>
                <p className="text-sm text-gray-500">Phone: {order.customerPhone}</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Pending
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
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => handlePrint(order)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </button>
              <button
                onClick={() => updateOrderStatus(order.id, 'not_done')}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Not Done
              </button>
              <button
                onClick={() => updateOrderStatus(order.id, 'completed')}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Done
              </button>
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No pending orders</p>
        </div>
      )}
    </div>
  );
}

export default OrderManagement;