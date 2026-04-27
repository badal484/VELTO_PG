import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import SEOHead from '../components/common/SEOHead';
import Loader from '../components/common/Loader';
import PGImageGallery from '../components/listing/PGImageGallery';
import AmenityIcon from '../components/common/AmenityIcon';
import RoomCard from '../components/listing/RoomCard';
import ReviewCard from '../components/listing/ReviewCard';
import { formatCurrency } from '../utils/formatters';


const PG_TYPE_LABELS = { male: 'Boys PG', female: 'Girls PG', 'co-ed': 'Co-ed PG' };

export default function PGDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pg, setPg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showWalkIn, setShowWalkIn] = useState(false);
  const [walkInForm, setWalkInForm] = useState({ name: '', phone: '', amount: '' });

  useEffect(() => {
    const fetchPG = async () => {
      try {
        const [pgRes, reviewsRes] = await Promise.all([
          api.get(`/pgs/${id}`),
          api.get(`/reviews/pg/${id}`)
        ]);
        
        const pgData = pgRes.data.data;
        setPg(pgData);
        const available = pgData.rooms?.find(r => r.availableBeds > 0);
        setSelectedRoom(available || pgData.rooms?.[0] || null);
        setReviews(reviewsRes.data.data || []);
        setCanReview(pgRes.data.canReview);
        
        if (user) {
          setIsWishlisted(user.wishlist?.includes(id));
        }

        // Session-based view count
        const viewKey = `viewed_${id}`;
        if (!sessionStorage.getItem(viewKey)) {
          sessionStorage.setItem(viewKey, '1');
          api.post(`/pgs/${id}/view`).catch(() => {});
        }
      } catch {
        toast.error('Failed to load property details');
        navigate('/listings');
      } finally {
        setLoading(false);
      }
    };
    fetchPG();
  }, [id, navigate]);

  const handleBookNow = () => {
    if (!user) return navigate('/login', { state: { from: { pathname: `/pg/${id}` } } });
    if (!selectedRoom || selectedRoom.availableBeds === 0) return toast.error('Selected room is fully booked');
    navigate(`/booking/${id}`);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.title.trim() || !reviewForm.comment.trim()) return toast.error('Please fill all fields');
    setSubmittingReview(true);
    try {
      const { data } = await api.post('/reviews', { ...reviewForm, pgId: id });
      toast.success('Review submitted successfully');
      setReviews(prev => [data.data, ...prev]);
      setShowReviewForm(false);
      setReviewForm({ rating: 5, title: '', comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) return navigate('/login', { state: { from: { pathname: `/pg/${id}` } } });
    try {
      await api.post(`/pgs/${id}/wishlist`);
      setIsWishlisted(!isWishlisted);
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const handleWalkIn = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        guestInfo: { name: walkInForm.name, phone: walkInForm.phone },
        roomType: selectedRoom.type,
        totalPrice: Number(walkInForm.amount) || selectedRoom.price
      };
      await api.post(`/owner/pgs/${id}/walk-in`, payload);
      toast.success('Walk-in booking recorded');
      setShowWalkIn(false);
      setWalkInForm({ name: '', phone: '', amount: '' });
      // Refresh PG data
      const { data } = await api.get(`/pgs/${id}`);
      setPg(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record walk-in');
    }
  };

  if (loading) return <Loader fullScreen />;
  if (!pg) return null;

  const activeAmenities = Object.entries(pg.amenities || {}).filter(([, v]) => v).map(([k]) => k);

  return (
    <>
      <SEOHead
        title={pg.name}
        description={`${pg.name} in ${pg.address?.area}, Bangalore — ${pg.description?.slice(0, 150)}`}
      />
      <div className="min-h-screen bg-white">
        {/* Gallery */}
        <div className="pt-20">
          <PGImageGallery images={pg.images || []} pgName={pg.name} />
        </div>

        <div className="page-container py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* ── Left column ── */}
            <div className="lg:col-span-2">
              <div className="mb-6 pb-6 border-b border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {pg.featured && (
                        <span className="badge-primary text-xs">Elite Collection</span>
                      )}
                      <span className="badge-neutral text-xs capitalize">{PG_TYPE_LABELS[pg.pgType] || pg.pgType}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{pg.name}</h1>
                  </div>
                  <button 
                    onClick={handleWishlistToggle}
                    className={`p-3 rounded-full border transition-all ${
                      isWishlisted ? 'bg-red-50 border-red-100 text-red-500' : 'bg-white border-gray-100 text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <svg className={`w-6 h-6 ${isWishlisted ? 'fill-current' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  {pg.rating > 0 && (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-bold text-gray-900">{pg.rating.toFixed(1)}</span>
                      <span>({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
                    </span>
                  )}
                  <span>•</span>
                  <span>{PG_TYPE_LABELS[pg.type] || pg.type}</span>
                  <span>•</span>
                  <span>{pg.address?.area}, Bangalore</span>
                  {pg.address?.landmark && <><span>•</span><span>Near {pg.address.landmark}</span></>}
                </div>
              </div>

              {/* Description */}
              <div className="mb-8 pb-8 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-3">About This Stay</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{pg.description}</p>
              </div>

              {/* Amenities */}
              {(activeAmenities.length > 0 || pg.foodDetails?.mealsProvided) && (
                <div className="mb-8 pb-8 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-5">What This Place Offers</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {activeAmenities.map(key => (
                      <AmenityIcon key={key} amenity={key} />
                    ))}
                    {!activeAmenities.includes('meals') && pg.foodDetails?.mealsProvided && (
                      <AmenityIcon amenity="meals" />
                    )}
                  </div>
                </div>
              )}

              {/* Rooms */}
              <div className="mb-8 pb-8 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-5">Room Types & Pricing</h2>
                <div className="space-y-3">
                  {pg.rooms?.map(room => (
                    <RoomCard
                      key={room.type}
                      room={room}
                      selected={selectedRoom?.type === room.type}
                      onSelect={setSelectedRoom}
                    />
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="mb-8 pb-8 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Location</h2>
                <p className="text-sm text-gray-600">
                  {pg.address?.street && `${pg.address.street}, `}
                  {pg.address?.area}, Bangalore — {pg.address?.pincode}
                </p>
                {pg.address?.landmark && (
                  <p className="text-sm text-gray-500 mt-1">Near {pg.address.landmark}</p>
                )}
                {pg.address?.googleMapsLink && (
                  <a href={pg.address.googleMapsLink} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-4 text-sm text-primary-500 font-semibold hover:underline">
                    View on Google Maps
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>

              {/* Reviews */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold text-gray-900">
                    Reviews {reviews.length > 0 && <span className="text-gray-400 font-normal text-base">({reviews.length})</span>}
                  </h2>
                  {canReview && (
                    <button onClick={() => setShowReviewForm(s => !s)} className="btn-secondary text-sm">
                      {showReviewForm ? 'Cancel' : 'Write a Review'}
                    </button>
                  )}
                  {user && !canReview && (
                    <span className="text-xs text-gray-400 font-medium bg-gray-50 px-3 py-1.5 rounded-lg">
                      Reviews available after 1 month stay
                    </span>
                  )}
                </div>

                {/* Review form */}
                {showReviewForm && (
                  <form onSubmit={handleReviewSubmit} className="card p-5 mb-6 space-y-4 slide-up">
                    <div>
                      <label className="input-label">Your Rating</label>
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button key={star} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: star }))}>
                            <svg className={`w-7 h-7 transition-colors ${star <= reviewForm.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="input-label">Title</label>
                      <input className="input-field" required value={reviewForm.title}
                        onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
                        placeholder="Summarize your experience" maxLength={100} />
                    </div>
                    <div>
                      <label className="input-label">Review</label>
                      <textarea className="input-field resize-none" rows={4} required
                        value={reviewForm.comment}
                        onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                        placeholder="Share details about your stay…" maxLength={1000} />
                    </div>
                    <button type="submit" disabled={submittingReview} className="btn-primary">
                      {submittingReview ? 'Submitting…' : 'Submit Review'}
                    </button>
                  </form>
                )}

                {reviews.length === 0 ? (
                  <p className="text-gray-400 text-sm">No reviews yet. Be the first to review!</p>
                ) : (
                  <div>
                    {reviews.filter(r => r.status === 'approved' || !r.status).map(review => (
                      <ReviewCard key={review._id} review={review} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Booking sidebar ── */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 card p-6 space-y-5">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {formatCurrency(selectedRoom?.price || pg.priceFrom)}
                  </span>
                  <span className="text-gray-400 text-sm">/ month</span>
                </div>

                {pg.rating > 0 && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <svg className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-bold text-gray-900">{pg.rating.toFixed(1)}</span>
                    <span className="text-gray-500">· {reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
                  </div>
                )}

                {selectedRoom && (
                  <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Room type</span>
                      <span className="font-semibold capitalize">{selectedRoom.type} sharing</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Security deposit</span>
                      <span className="font-semibold">{formatCurrency(selectedRoom.securityDeposit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Availability</span>
                      <span className={`font-semibold ${selectedRoom.availableBeds > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {selectedRoom.availableBeds > 0 ? `${selectedRoom.availableBeds} beds left` : 'Fully booked'}
                      </span>
                    </div>
                  </div>
                )}

                {user?._id === pg.owner?.toString() || user?._id === pg.owner?._id ? (
                  <button
                    onClick={() => setShowWalkIn(true)}
                    className="btn-secondary w-full py-3.5 border-primary-500 text-primary-600 font-bold"
                  >
                    Record Walk-in Resident
                  </button>
                ) : (
                  <button
                    onClick={handleBookNow}
                    disabled={!selectedRoom || selectedRoom.availableBeds === 0}
                    className="btn-primary w-full py-3.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {selectedRoom?.availableBeds === 0 ? 'Fully Booked' : 'Book This Stay'}
                  </button>
                )}

                <p className="text-xs text-gray-400 text-center">You won't be charged until payment confirmation</p>

                <div className="flex items-start gap-3 pt-2 border-t border-gray-100">
                  <div className="w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    <span className="font-semibold text-gray-700">Velto Assurance</span> — Verified property. Refundable deposits and quality guarantee.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Walk-in Modal */}
      {showWalkIn && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl slide-up">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Record Walk-in</h3>
                <p className="text-xs text-gray-500 mt-1">For {selectedRoom?.type} sharing room</p>
              </div>
              <button onClick={() => setShowWalkIn(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleWalkIn} className="space-y-4">
              <div>
                <label className="input-label">Guest Name</label>
                <input className="input-field" value={walkInForm.name} onChange={e => setWalkInForm(f => ({ ...f, name: e.target.value }))} required placeholder="Full name" />
              </div>
              <div>
                <label className="input-label">Phone Number</label>
                <input className="input-field" value={walkInForm.phone} onChange={e => setWalkInForm(f => ({ ...f, phone: e.target.value }))} required placeholder="Mobile number" />
              </div>
              <div>
                <label className="input-label">Amount Paid</label>
                <input type="number" className="input-field" value={walkInForm.amount || selectedRoom?.price} onChange={e => setWalkInForm(f => ({ ...f, amount: e.target.value }))} required placeholder="Price" />
              </div>
              <div className="pt-4">
                <button type="submit" className="btn-primary w-full py-3">Confirm Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}