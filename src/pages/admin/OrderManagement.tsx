import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Printer, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePaymentStore } from '../../store/paymentStore'; // Assuming the store is in store/paymentStore.ts

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
  paymentId: string; // Add paymentId to order
  orderId: string; // Add orderId to order
  signature: string
}

function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const { verifyPayment } = usePaymentStore();

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
      Order Details:
      Customer: ${order.customerName}
      Seat: ${order.seatNumber}
      Phone: ${order.customerPhone}
      
      Items:
      ${order.items.map(item => `${item.name} x${item.quantity} - ₹${item.price * item.quantity}`).join('\n')}
      
      Total: ₹${order.total}
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`<pre>${printContent}</pre>`);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const markAsCompleted = async (order: Order) => {
    try {
      // Verify the payment before marking the order as completed
      const isVerified = await verifyPayment(order.orderId, order.paymentId, order.signature); // Assuming the signature is part of the order data
      if (isVerified) {
        await updateDoc(doc(db, 'orders', order.id), {
          status: 'completed',
          completedAt: new Date().toISOString(),
        });
        toast.success('Order marked as completed');
        fetchOrders(); // Refresh orders
      } else {
        toast.error('Payment verification failed. Cannot complete the order.');
      }
    } catch (error) {
      toast.error('Failed to verify payment or update order status');
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
                onClick={() => markAsCompleted(order)}
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