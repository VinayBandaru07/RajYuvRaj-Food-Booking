import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { usePaymentStore } from '../store/paymentStore';
import { ArrowLeft, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import LoadingSpinner from '../components/LoadingSpinner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

function Payment() {
  const navigate = useNavigate();
  const { cart, name, phone, seatNumber, clearCart } = useStore();
  const { createOrder, verifyPayment, updateTransactionStatus } = usePaymentStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load Razorpay SDK
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setIsLoading(false);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const calculateTotal = () => {
    const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const sgst = subtotal * 0.025;
    const cgst = subtotal * 0.025;
    const handlingCharges = 4;
    return subtotal + sgst + cgst + handlingCharges;
  };

  const handlePayment = async () => {
    try {
      console.log(calculateTotal());
      setIsProcessing(true);
      const amount = calculateTotal();
      const receipt = `ORDER_${Date.now()}`;

      // Create order in Razorpay
      const order = await createOrder(amount*100, receipt);
      // Create transaction record
      const transaction = await addDoc(collection(db, 'transactions'), {
        orderId: order.id,
        amount: amount*100,
        customerName: name,
        customerPhone: phone,
        seatNumber,
        status: 'pending',
        items: cart,
        createdAt: new Date().toISOString(),
        verificationDetails: {
          verified: false,
          timestamp: null
        }
      });

      const options = {
        key: 'rzp_test_2r4RjQY2BcnXVF', // Replace with your key
        amount: amount * 100,
        currency: 'INR',
        name: 'Movie Food',
        description: 'Food Order Payment',
        order_id: order.id,
        prefill: {
          name,
          contact: phone
        },
        handler: async function (response: any) {
          try {
            // Verify payment signature
            const isValid = await verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );

            if (isValid) {
              // Update transaction status
              await updateTransactionStatus(transaction.id, 'success', {
                verified: true,
                timestamp: new Date().toISOString(),
                paymentId: response.razorpay_payment_id
              });

              // Create order in database
              await addDoc(collection(db, 'orders'), {
                items: cart,
                total: amount,
                customerName: name,
                customerPhone: phone,
                seatNumber,
                status: 'pending',
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                createdAt: new Date().toISOString()
              });

              clearCart();
              navigate('/order-confirmation');
              toast.success('Payment successful!');
            } else {
              await updateTransactionStatus(transaction.id, 'failed', {
                verified: false,
                timestamp: new Date().toISOString(),
                error: 'Invalid signature'
              });
              toast.error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed');
          }
        },
        modal: {
          ondismiss: async function () {
            await updateTransactionStatus(transaction.id, 'failed', {
              verified: false,
              timestamp: new Date().toISOString(),
              error: 'Payment cancelled'
            });
            setIsProcessing(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error('Failed to initiate payment');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Cart</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Payment Details</h2>
            
            <div className="space-y-6">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Order Summary</h3>
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} x {item.quantity}</span>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-4 pt-4">
                  <div className="flex justify-between font-semibold">
                    <span>Total Amount</span>
                    <span>₹{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-4">Delivery Details</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Name:</span> {name}</p>
                  <p><span className="font-medium">Phone:</span> {phone}</p>
                  <p><span className="font-medium">Seat Number:</span> {seatNumber}</p>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 transition-colors duration-300 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>{isProcessing ? 'Processing...' : 'Pay with Razorpay'}</span>
                </button>

                <p className="text-sm text-gray-500 text-center">
                  By clicking "Pay with Razorpay", you agree to our terms and conditions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;