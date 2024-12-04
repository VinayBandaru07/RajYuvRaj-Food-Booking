import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Printer, Download, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { exportOrders } from '../../utils/exportOrders';
import { format } from 'date-fns';
import { calculateTaxes } from '../../utils/calculateTaxes';

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
  screen: string;
  status: string;
  createdAt: string;
  completedAt: string;
  completionStatus: 'success' | 'failed';
}

function CompletedOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchCompletedOrders();
  }, [selectedDate]);

  const fetchCompletedOrders = async () => {
    try {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const q = query(
        collection(db, 'orders'),
        where('status', 'in', ['completed', 'not_done']),
        where('createdAt', '>=', startOfDay.toISOString()),
        where('createdAt', '<=', endOfDay.toISOString())
      );

      const querySnapshot = await getDocs(q);
      const fetchedOrders: Order[] = [];
      querySnapshot.forEach((doc) => {
        fetchedOrders.push({ id: doc.id, ...doc.data() } as Order);
      });
      setOrders(
        fetchedOrders.sort((a, b) =>
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        )
      );
    } catch (error) {
      toast.error('Failed to fetch completed orders');
      console.error(error);
    }
  };

  const handlePrint = (order: Order) => {
    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const { sgst, cgst, handlingCharges } = calculateTaxes(subtotal);

    const printContent = `
      ---------------------------------
                Customer Copy
                G3 CINEMA
      ---------------------------------
      Completed At: ${new Date(order.completedAt).toLocaleString()}
      GSTN :37AAKFV0150G1Z9

      Order Details:
      ---------------------------------
      Customer Name  : ${order.customerName}
      Seat Number    : ${order.seatNumber}
      Screen         : ${order.screen}
      Phone Number   : ${order.customerPhone}
      ---------------------------------
      Items:
      ---------------------------------
      ${String(`Item Name`).padEnd(15) + String(`Qty`).padEnd(5) + String(`Price`)}
${order.items
  .map(
    (item) =>
      `      ${item.name.padEnd(15)} x${item.quantity}  ₹${(
        item.price * item.quantity
      ).toFixed(2)}`
  )
  .join('\n')}

      Handling Charges(4%) : ₹${handlingCharges.toFixed(2)}
      ---------------------------------
      Total Amount   : ₹${order.total.toFixed(2)}
      ---------------------------------
      Thank You for Choosing G3 Cinema!
`;


    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`<pre>${printContent}</pre>`);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleExport = () => {
    if (orders.length === 0) {
      toast.error('No orders to export');
      return;
    }
    try {
      exportOrders(orders, selectedDate);
      toast.success('Orders exported successfully');
    } catch (error) {
      toast.error('Failed to export orders');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-around items-center mx-auto">
        <h2 className="lg:text-2xl md:text-2xl font-bold text-gray-900 hidden lg:block md:block">
          Completed Orders
        </h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <input
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {orders.map((order) => {
          const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
          const { sgst, cgst, handlingCharges } = calculateTaxes(subtotal);

          return (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{order.customerName}</h3>
                  <p className="text-sm text-gray-500">Seat: {order.seatNumber}</p>
                  <p className="text-sm text-gray-500">Screen: {order.screen}</p>
                  <p className="text-sm text-gray-500">
                    Completed: {new Date(order.completedAt).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.completionStatus === 'success'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {order.completionStatus === 'success' ? 'Completed' : 'Not Done'}
                </span>
              </div>

              <div className="border-t border-b py-4 my-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Order Items:</h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>
                        {item.name} x{item.quantity}
                      </span>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  {/* <div className="flex justify-between text-sm">
                    <span>SGST (2.5%)</span>
                    <span>₹{sgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>CGST (2.5%)</span>
                    <span>₹{cgst.toFixed(2)}</span>
                  </div> */}
                  <div className="flex justify-between text-sm">
                    <span>Handling Charges (4%)</span>
                    <span>₹{handlingCharges.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Total</span>
                    <span>₹{order.total.toFixed(2)}</span>
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
          );
        })}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No orders found for the selected date.</p>
        </div>
      )}
    </div>
  );
}

export default CompletedOrders;
