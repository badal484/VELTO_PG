import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import Loader from '../../components/common/Loader';
import { formatCurrency, formatDate } from '../../utils/formatters';

const AMENITY_LABELS = {
  wifi: 'WiFi', ac: 'AC', meals: 'Meals', laundry: 'Laundry', parking: 'Parking',
  gym: 'Gym', security: 'Security', powerBackup: 'Power Backup', housekeeping: 'Housekeeping',
  tv: 'TV', geyser: 'Geyser', cctv: 'CCTV',
};

export default function AdminApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    api.get(`/admin/applications/${id}`)
      .then(({ data }) => setApp(data.data))
      .catch(() => toast.error('Failed to load application'))
      .finally(() => setLoading(false));
  }, [id]);

  const action = async (type, body = {}) => {
    setActing(true);
    try {
      await api.put(`/admin/applications/${id}/${type}`, body);
      toast.success(`Application ${type === 'approve' ? 'approved' : type === 'reject' ? 'rejected' : 'moved to inspection'}`);
      navigate('/admin/applications');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActing(false);
    }
  };

  if (loading) return <Loader />;
  if (!app) return null;

  const amenities = Object.entries(app.amenities || {}).filter(([, v]) => v).map(([k]) => AMENITY_LABELS[k] || k);

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <button onClick={() => navigate('/admin/applications')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 text-sm font-medium">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to Applications
      </button>

      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{app.pgName}</h1>
          <p className="text-gray-500 mt-1">Submitted by {app.applicant?.name} · {formatDate(app.createdAt)}</p>
        </div>
        <span className={`text-sm font-bold px-3 py-1 rounded-full capitalize ${
          app.status === 'approved' ? 'bg-green-100 text-green-700' :
          app.status === 'rejected' ? 'bg-red-100 text-red-700' :
          app.status === 'inspection' ? 'bg-blue-100 text-blue-700' :
          'bg-amber-100 text-amber-700'
        }`}>{app.status}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Basic Info */}
        <div className="card p-5">
          <h2 className="font-bold text-gray-900 mb-4">Property Details</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex gap-2"><dt className="text-gray-500 w-32 flex-shrink-0">Type</dt><dd className="font-medium capitalize">{app.pgType}</dd></div>
            <div className="flex gap-2"><dt className="text-gray-500 w-32 flex-shrink-0">Area</dt><dd className="font-medium">{app.address?.area}</dd></div>
            <div className="flex gap-2"><dt className="text-gray-500 w-32 flex-shrink-0">Street</dt><dd className="font-medium">{app.address?.street}</dd></div>
            <div className="flex gap-2"><dt className="text-gray-500 w-32 flex-shrink-0">Pincode</dt><dd className="font-medium">{app.address?.pincode}</dd></div>
            {app.address?.landmark && <div className="flex gap-2"><dt className="text-gray-500 w-32 flex-shrink-0">Landmark</dt><dd className="font-medium">{app.address.landmark}</dd></div>}
          </dl>
        </div>

        {/* Owner Info */}
        <div className="card p-5">
          <h2 className="font-bold text-gray-900 mb-4">Owner Details</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex gap-2"><dt className="text-gray-500 w-32 flex-shrink-0">Name</dt><dd className="font-medium">{app.applicant?.name}</dd></div>
            <div className="flex gap-2"><dt className="text-gray-500 w-32 flex-shrink-0">Email</dt><dd className="font-medium">{app.applicant?.email}</dd></div>
            <div className="flex gap-2"><dt className="text-gray-500 w-32 flex-shrink-0">Phone</dt><dd className="font-medium">{app.applicant?.phone}</dd></div>
          </dl>
        </div>
      </div>

      {/* Description */}
      <div className="card p-5 mb-6">
        <h2 className="font-bold text-gray-900 mb-3">Description</h2>
        <p className="text-gray-600 text-sm leading-relaxed">{app.description}</p>
      </div>

      {/* Rooms */}
      <div className="card p-5 mb-6">
        <h2 className="font-bold text-gray-900 mb-4">Rooms & Pricing</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {app.rooms?.map((room, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-4 text-sm">
              <p className="font-bold text-gray-900 capitalize mb-2">{room.type} sharing</p>
              <div className="space-y-1 text-gray-600">
                <div className="flex justify-between"><span>Price</span><span className="font-semibold">{formatCurrency(room.price)}/mo</span></div>
                <div className="flex justify-between"><span>Deposit</span><span className="font-semibold">{formatCurrency(room.securityDeposit)}</span></div>
                <div className="flex justify-between"><span>Total Beds</span><span className="font-semibold">{room.totalBeds}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Amenities */}
      {amenities.length > 0 && (
        <div className="card p-5 mb-6">
          <h2 className="font-bold text-gray-900 mb-3">Amenities</h2>
          <div className="flex flex-wrap gap-2">
            {amenities.map(a => (
              <span key={a} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">{a}</span>
            ))}
          </div>
        </div>
      )}

      {/* Images */}
      {app.images?.length > 0 && (
        <div className="card p-5 mb-6">
          <h2 className="font-bold text-gray-900 mb-3">Photos ({app.images.length})</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {app.images.map((img, i) => (
              <img
                key={i}
                src={img.url}
                alt={`Property view ${i + 1}`}
                onClick={() => setSelectedImage(img.url)}
                className="w-full h-24 object-cover rounded-xl cursor-pointer hover:brightness-90 transition-all"
              />
            ))}
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 md:p-10 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img 
            src={selectedImage} 
            alt="Preview" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl scale-in" 
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Actions */}
      {(app.status === 'pending' || app.status === 'submitted' || app.status === 'inspection' || app.status === 'under_review') && (
        <div className="card p-5">
          <h2 className="font-bold text-gray-900 mb-4">Actions</h2>
          <div className="flex flex-wrap gap-3">
            {app.status === 'pending' && (
              <button onClick={() => action('inspection')} disabled={acting}
                className="btn-secondary">
                Mark for Inspection
              </button>
            )}
            <button onClick={() => action('approve')} disabled={acting}
              className="bg-green-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-green-600 transition-all disabled:opacity-50">
              Approve & Create Listing
            </button>
            <button onClick={() => setShowReject(s => !s)} disabled={acting}
              className="bg-red-50 text-red-600 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-red-100 transition-all">
              Reject
            </button>
          </div>

          {showReject && (
            <div className="mt-4 space-y-3">
              <textarea className="input-field resize-none" rows={3}
                value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                placeholder="Reason for rejection (will be sent to applicant)…" />
              <button onClick={() => action('reject', { reason: rejectReason })} disabled={acting || !rejectReason.trim()}
                className="bg-red-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-red-600 disabled:opacity-50">
                Confirm Rejection
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}