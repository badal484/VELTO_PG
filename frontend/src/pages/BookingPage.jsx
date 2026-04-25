import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import SEOHead from '../components/common/SEOHead';
import BookingForm from '../components/booking/BookingForm';
import RefundPolicyInfo from '../components/booking/RefundPolicyInfo';
import RoomCard from '../components/listing/RoomCard';
import Loader from '../components/common/Loader';
import { formatCurrency } from '../utils/formatters';

function loadRazorpayScript() {
  return new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function BookingPage() {
  const { pgId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pg, setPg] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const bookingRef = useRef(null);

  useEffect(() => {
    api.get(`/pgs/${pgId}`)
      .then(({ data }) => {
        setPg(data.data);
        const available = data.data.rooms?.find(r => r.availableBeds > 0);
        if (available) setSelectedRoom(available);
      })
      .catch(() => toast.error('Failed to load property'))
      .finally(() => setLoading(false));
  }, [pgId]);

  const handleBooking = async ({ checkIn, duration, totalPrice, securityDeposit, specialRequests }) => {
    setSubmitting(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Razorpay SDK failed to load');

      // Create booking
      const { data: bookingData } = await api.post('/bookings', {
        pgId,
        roomType: selectedRoom.type,
        checkIn,
        duration,
        totalPrice,
        securityDeposit,
        specialRequests,
      });
      const booking = bookingData.data;
      bookingRef.current = booking._id;

      // Create Razorpay order
      const { data: orderData } = await api.post('/payments/order', { bookingId: booking._id });
      const order = orderData.data;

      // Open Razorpay
      console.log('Opening Razorpay with order:', order);
      const rzp = new window.Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: 'INR',
        name: 'Velto Stay',
        description: `Booking for ${pg.name}`,
        order_id: order.id,
        prefill: { name: user.name, email: user.email, contact: user.phone },
        theme: { color: '#FF385C' },
        handler: async (response) => {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success('Booking confirmed!');
            navigate(`/booking/success/${bookingRef.current}`);
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        modal: {
          ondismiss: async () => {
            // Cancel the booking if payment is dismissed
            try {
              await api.put(`/bookings/${bookingRef.current}/cancel`, { reason: 'Payment dismissed' });
            } catch {}
            toast.error('Payment cancelled');
            setSubmitting(false);
          },
        },
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Booking failed');
      setSubmitting(false);
    }
  };

  if (loading) return <Loader fullScreen />;
  if (!pg) return null;

  return (
    <>
      <SEOHead title={`Book — ${pg.name}`} />
      <div className="pt-24 pb-16 min-h-screen bg-gray-50">
        <div className="page-container max-w-4xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
            <Link to={`/pg/${pgId}`} className="hover:text-gray-600">← Back to {pg.name}</Link>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-8">Complete Your Booking</h1>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left */}
            <div className="lg:col-span-3 space-y-6">
              {/* Room selection */}
              <div className="card p-6">
                <h2 className="font-bold text-gray-900 mb-4">Select Room Type</h2>
                <div className="space-y-3">
                  {pg.rooms.map(room => (
                    <RoomCard key={room.type} room={room} selected={selectedRoom?.type === room.type} onSelect={setSelectedRoom} />
                  ))}
                </div>
              </div>

              {/* Booking form */}
              <div className="card p-6">
                <h2 className="font-bold text-gray-900 mb-4">Booking Details</h2>
                <BookingForm pg={pg} room={selectedRoom} onSubmit={handleBooking} loading={submitting} />
              </div>
            </div>

            {/* Right — PG summary */}
            <div className="lg:col-span-2">
              <div className="card p-5 sticky top-28">
                {pg.images?.[0]?.url && (
                  <img src={pg.images[0].url} alt={pg.name} className="w-full h-40 object-cover rounded-xl mb-4" />
                )}
                <h3 className="font-bold text-gray-900">{pg.name}</h3>
                <p className="text-xs text-gray-400 mt-1 mb-4">{pg.address?.area}, {pg.address?.city}</p>

                {selectedRoom && (
                  <div className="bg-gray-50 rounded-xl p-3 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500 capitalize">{selectedRoom.type} sharing</span>
                      <span className="font-bold text-gray-900">{formatCurrency(selectedRoom.price)}/mo</span>
                    </div>
                  </div>
                )}

                <RefundPolicyInfo />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
