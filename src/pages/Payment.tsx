import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useMenuStore } from '../store/menuStore';
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
  const { cart, name, phone, seatNumber, clearCart, removeFromCart, screen } = useStore();
  const { items: menuItems, startRealTimeUpdates } = useMenuStore();
  const { createOrder, verifyPayment, updateTransactionStatus } = usePaymentStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  useEffect(() => {
    const unsubscribe = startRealTimeUpdates();
    return () => unsubscribe();
  }, []);

  // Listen for menu changes and handle out-of-stock items
  useEffect(() => {
    let hasOutOfStockItems = false;
    cart.forEach(cartItem => {
      const menuItem = menuItems.find(item => item.id === cartItem.id);
      if (menuItem && !menuItem.enabled) {
        removeFromCart(cartItem.id);
        hasOutOfStockItems = true;
      }
    });

    if (hasOutOfStockItems) {
      toast.error('Some items in your cart are now out of stock');
      navigate('/cart');
    }
  }, [menuItems, cart]);

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
    const subtotal = cart.reduce((total, item) => {
      const menuItem = menuItems.find(mi => mi.id === item.id);
      if (!menuItem?.enabled) return total;
      return total + item.price * item.quantity;
    }, 0);
    const sgst = subtotal * 0;
    const cgst = subtotal * 0;
    const handlingCharges = subtotal * 0.040;
    return subtotal + sgst + cgst + handlingCharges;
  };

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      const amount = calculateTotal();
      const receipt = `ORDER_${Date.now()}`;

      // Create order in Razorpay
      const order = await createOrder(Number(parseFloat(String(amount*100)).toFixed(2)), receipt);
      
      // Create transaction record
      const transaction = await addDoc(collection(db, 'transactions'), {
        orderId: order.id,
        amount: Number(parseFloat(String(amount*100)).toFixed(2)),
        receipt:receipt,
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
        key: import.meta.env.VITE_API_KEY,
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
                screen,
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
                  {cart.map((item) => {
                    const menuItem = menuItems.find(mi => mi.id === item.id);
                    if (!menuItem?.enabled) return null;
                    
                    return (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.name} x {item.quantity}</span>
                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t mt-4 pt-4">
      <div className="flex justify-between text-sm">
        <span>Subtotal</span>
        <span>₹{(cart.reduce((total, item) => total + item.price * item.quantity, 0)).toFixed(2)}</span>
      </div>
      {/* <div className="flex justify-between text-sm">
        <span>CGST (2.5%)</span>
        <span>₹{(cart.reduce((total, item) => total + item.price * item.quantity, 0) * 0.025).toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>SGST (2.5%)</span>
        <span>₹{(cart.reduce((total, item) => total + item.price * item.quantity, 0) * 0.025).toFixed(2)}</span>
      </div> */}
      <div className="flex justify-between text-sm">
        <span>Handling Charges (4%)</span>
        <span>₹{(cart.reduce((total, item) => total + item.price * item.quantity, 0) * 0.04).toFixed(2)}</span>
      </div>  
      <div className="flex justify-between font-semibold text-lg mt-4">
        <span>Total</span>
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
                  <p><span className="font-medium">Screen:</span> {screen}</p>
                </div>
              </div>
              
              <div>
  <p style={{ fontWeight: 'bold', color: 'red', fontSize: '1rem', textAlign:'center' }}>
    Wait until your order is confirmed after payment, and don't exit or reload this page while it's processing.
  </p><br />
  <p style={{ color: 'gray', fontSize: '0.8rem', textAlign:'center' }}>
    Contact our food counter if you have issues about payment or order confirmation, we are always happy to assist.
  </p>
</div>


              <div className="space-y-4">
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 transition-colors duration-300 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>{isProcessing ? 'Processing...' : 'Pay with Razorpay'}</span>
                </button>

                <div>
      {/* Payment text */}
      <p className="text-sm text-gray-500 text-center">
        By clicking "Pay with Razorpay", you agree to our{" "}
        <span
          onClick={toggleModal}
          className="text-purple-600 hover:underline cursor-pointer"
        >
          terms and conditions
        </span>.
      </p>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-lg font-semibold">Terms and Conditions</h2>
              <button
                onClick={toggleModal}
                className="text-gray-600 hover:text-red-600"
              >
                ✖
              </button>
            </div>

            {/* Modal Content with Scroll */}
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {/* Replace with your actual terms and conditions */}
              <p className="text-gray-600 text-sm">
              <span style={{fontWeight:'bold'}}>OVERVIEW </span><br /><br />
This website is operated by G3 THEATRES LLP Throughout the site, the terms “we”, “us” and “our” refer to G3 THEATRES LLP . G3 THEATRES LLP offers this website, including all information, tools and services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies and notices stated here.
<br />By visiting our site and/ or purchasing something from us, you engage in our “Service” and agree to be bound by the following Terms and Conditions .. <br />These Terms and Conditions apply  to all users of the site, including without limitation users who are browsers, customers, merchants, and/ or contributors of content.
Please read these Terms and Conditions carefully before accessing or using our website. <br />By accessing or using any part of the site, you agree to be bound by these Terms and Conditions. If you do not agree to all the terms and conditions of this agreement, then you may not access the payment or use any services. 
Any new features or tools which are added to the current store shall also be subject to the terms and conditions. You can review the most current version of the Terms and Conditions at any time on this page. We reserve the right to update, change or replace any part of these Terms and Conditions by posting updates and/or changes to our website. It is your responsibility to check this page periodically for changes. Your continued use of or access to the website following the posting of any changes constitutes acceptance of those changes.
<br /><br /><span style={{fontWeight:'bold'}}>Terms and Conditions</span>
              </p>
              <p className="text-gray-600 text-sm mt-4">
             <span style={{fontWeight:'500'}}>1. Pricing Policy</span> <br />
All prices displayed on our website are exclusive of applicable taxes and fees.
The total bill will include the following charges:
CGST (Central Goods and Services Tax): 2.5%
SGST (State Goods and Services Tax): 2.5%
Handling Fee: 4% (comprising Razorpay charges of 2% and additional platform handling charges of 2%).
<br /><br />
<span style={{fontWeight:'500'}}>2. what do we do with your information </span><br />
When you purchase something from our theatre, as part of the selling process, we collect the personal information you give us such as your name, phone number, seat number and screen to handle the order to reach you while delivering the item/items.
<br /><br />
<span style={{fontWeight:'500'}}>3. Payee Information</span><br />
All payments made on this platform are directed to G3 THEATRES LLP.
<br /><br />
<span style={{fontWeight:'500'}}>4. Payment Methods</span><br />
We use Razorpay for processing payments. We/Razorpay do not store your card data on their servers. The data is encrypted through the Payment Card Industry Data Security Standard (PCI-DSS) when processing payment. Your purchase transaction data is only used as long as is necessary to complete your purchase transaction. After that is complete, your purchase transaction information is not saved.
Our payment gateway adheres to the standards set by PCI-DSS as managed by the PCI Security Standards Council, which is a joint effort of brands like Visa, MasterCard, American Express and Discover.
PCI-DSS requirements help ensure the secure handling of credit card information by our store and its service providers.
For more insight, you may also want to read terms and conditions of razorpay on https://razorpay.com
<br /><br />
<span style={{fontWeight:'500'}}>5. Transaction Confirmation</span><br />
After a successful transaction, you will receive a confirmation of your order and payment in the webpage itself. Please ensure that the details provided are accurate.
<br /><br />
<span style={{fontWeight:'500'}}>6. Food Items: Health and Safety</span><br />
All food items listed on this website adhere to strict health and safety standards.
We source food items from trusted suppliers to ensure quality and compliance with food safety regulations.
Customers with specific allergies or dietary restrictions are advised to review item details carefully before placing an order.
<br /><br />
<span style={{fontWeight:'500'}}>7. Ownership of Food Items</span><br />
The ownership and responsibility for the preparation and quality of food items lie with G3 THEATRES LLP or its associated partners.
Any issues related to food preparation or quality will be addressed by the management of G3 THEATRES LLP.
<br /><br />
<span style={{fontWeight:'500'}}>8. protection & privacy policy</span><br />
To protect your personal information, we take reasonable precautions and follow industry best practices to make sure it is not inappropriately lost, misused, accessed, disclosed, altered or destroyed.
All personal and payment information provided during the ordering process is handled securely and used solely for the purpose of completing transactions and improving user experience.
<br /><br />
<span style={{fontWeight:'500'}}>9. Refund and Cancellation Policy</span><br />
Once an order is placed, it cannot be canceled or refunded.
<br /><br />
<span style={{fontWeight:'500'}}>10. Taxes and Fees</span><br />
Any additional taxes or fees applicable at the time of purchase will be clearly indicated in your order summary before checkout.
<br /><br />
<span style={{fontWeight:'500'}}>11. Dispute Resolution</span><br />
For any payment disputes, quality concerns, or queries, please contact our support team. We strive to address all concerns promptly.
<br /><br />
<span style={{fontWeight:'500'}}>12. changes to this privacy policy</span><br />
We reserve the right to modify this privacy policy at any time, so please review it frequently. Changes and clarifications will take effect immediately upon their posting on the website. If we make material changes to this policy, we will notify you here that it has been updated, so that you are aware of what information we collect, how we use it, and under what circumstances, if any, we use and/or disclose it.
If our store is acquired or merged with another company, your information may be transferred to the new owners so that we may continue to sell products to you.
<br /><br />
<span style={{fontWeight:'500'}}>13. Acknowledgment</span><br />
By placing an order and completing the payment, you acknowledge and accept these terms and conditions.

<br /><br />
Contact: 9346917375 <br />
Email: harigepl@gmail.com <br />
Address: Raj Yuvraj(G3 THEATRES),Andra Ratna Road ,gandi nagar,Vijayawada, andra pradesh,520010,india
<br />






              </p>
              {/* Add more content as needed */}
            </div>

            {/* Modal Footer */}
            <div className="border-t p-4 flex justify-end">
              <button
                onClick={toggleModal}
                className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;