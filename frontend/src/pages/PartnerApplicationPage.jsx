import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import SEOHead from '../components/common/SEOHead';
import StepIndicator from '../components/partner/StepIndicator';
import ApplicationStatus from '../components/partner/ApplicationStatus';
import ImageUploadZone from '../components/partner/ImageUploadZone';
import { BANGALORE_AREAS } from '../utils/bangaloreAreas';
import Loader from '../components/common/Loader';

const STEPS = ['Basic Info', 'Location', 'Rooms & Pricing', 'Amenities', 'Photos & Submit'];

const INITIAL = {
  pgName: '', pgType: '', description: '',
  address: { street: '', area: '', landmark: '', pincode: '', googleMapsLink: '', coordinates: { lat: '', lng: '' } },
  rooms: [{ type: 'single', price: '', securityDeposit: '', totalBeds: '', amenities: [] }],
  amenities: {},
  images: [],
};

export default function PartnerApplicationPage() {
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INITIAL);
  const [existing, setExisting] = useState(null);
  const [isNewApplication, setIsNewApplication] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/partner/application')
      .then(({ data }) => setExisting(data.data))
      .catch(() => {})
      .finally(() => setLoadingExisting(false));
  }, []);

  const setField = (path, value) => {
    setForm(prev => {
      const next = { ...prev };
      const parts = path.split('.');
      let cur = next;
      for (let i = 0; i < parts.length - 1; i++) {
        cur[parts[i]] = { ...cur[parts[i]] };
        cur = cur[parts[i]];
      }
      cur[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const addRoom = () => setForm(f => ({ ...f, rooms: [...f.rooms, { type: 'double', price: '', securityDeposit: '', totalBeds: '', amenities: [] }] }));
  const removeRoom = (idx) => setForm(f => ({ ...f, rooms: f.rooms.filter((_, i) => i !== idx) }));
  const setRoom = (idx, key, val) => setForm(f => {
    const rooms = [...f.rooms];
    rooms[idx] = { ...rooms[idx], [key]: val };
    return { ...f, rooms };
  });

  const handleAreaChange = (areaName) => {
    setField('address.area', areaName);
    const area = BANGALORE_AREAS.find(a => a.name === areaName);
    if (area) { setField('address.coordinates.lat', area.lat); setField('address.coordinates.lng', area.lng); }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        rooms: form.rooms.map(r => ({
          ...r,
          price: Number(r.price),
          securityDeposit: Number(r.securityDeposit),
          totalBeds: Number(r.totalBeds),
        })),
        address: {
          ...form.address,
          coordinates: {
            type: 'Point',
            coordinates: [
              Number(form.address.coordinates.lng),
              Number(form.address.coordinates.lat)
            ]
          },
        },
      };
      await api.post('/partner/apply', payload);
      toast.success('Application submitted! We\'ll review it within 2–3 business days.');
      const { data } = await api.get('/partner/application');
      setExisting(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingExisting) return <Loader fullScreen />;

  if (existing) {
    return (
      <>
        <SEOHead title="Application Status" />
        <div className="pt-24 pb-16 min-h-screen bg-gray-50">
          <div className="page-container max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Your Application</h1>
            <ApplicationStatus application={existing} />
            
            {['approved', 'rejected', 'submitted'].includes(existing.status) && !isNewApplication && (
              <div className="mt-8 pt-8 border-t border-gray-200 text-center">
                <p className="text-gray-500 text-sm mb-4">Want to list another property?</p>
                <button 
                  onClick={() => {
                    setExisting(null);
                    setIsNewApplication(true);
                    setForm(INITIAL);
                    setStep(0);
                  }} 
                  className="btn-secondary w-full py-3"
                >
                  Apply for Another Property
                </button>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  const AMENITY_LIST = ['wifi', 'ac', 'meals', 'laundry', 'parking', 'gym', 'security', 'powerBackup', 'housekeeping', 'tv', 'geyser', 'cctv'];

  return (
    <>
      <SEOHead title="Apply to List Your PG" />
      <div className="pt-24 pb-16 min-h-screen bg-gray-50">
        <div className="page-container max-w-2xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Partner Application</h1>

          <div className="mb-8 overflow-x-auto pb-2">
            <StepIndicator steps={STEPS} currentStep={step} />
          </div>

          <div className="card p-6 md:p-8">
            {/* Step 0: Basic Info */}
            {step === 0 && (
              <div className="space-y-4">
                <h2 className="font-bold text-gray-900 text-lg mb-4">Basic Information</h2>
                <div>
                  <label className="input-label">PG / Property Name *</label>
                  <input className="input-field" value={form.pgName} onChange={e => setField('pgName', e.target.value)} placeholder="e.g. Sunrise PG for Girls" required />
                </div>
                <div>
                  <label className="input-label">Property Type *</label>
                  <div className="flex gap-2">
                    {['male', 'female', 'co-ed'].map(t => (
                      <button key={t} type="button" onClick={() => setField('pgType', t)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all capitalize ${form.pgType === t ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-200 text-gray-600'}`}>
                        {t === 'male' ? 'Boys PG' : t === 'female' ? 'Girls PG' : 'Co-ed'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="input-label">Description * <span className="text-gray-400 font-normal">(min 100 characters)</span></label>
                  <textarea className="input-field resize-none" rows={5} value={form.description} onChange={e => setField('description', e.target.value)} placeholder="Describe your property, amenities, surroundings, and what makes it special…" />
                  <p className="text-xs text-gray-400 mt-1">{form.description.length}/100 minimum</p>
                </div>
              </div>
            )}

            {/* Step 1: Location */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="font-bold text-gray-900 text-lg mb-4">Location Details</h2>
                <div>
                  <label className="input-label">Area *</label>
                  <select className="input-field" value={form.address.area} onChange={e => handleAreaChange(e.target.value)} required>
                    <option value="">Select area</option>
                    {BANGALORE_AREAS.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">Street Address *</label>
                  <input className="input-field" value={form.address.street} onChange={e => setField('address.street', e.target.value)} placeholder="House no., road name" required />
                </div>
                <div>
                  <label className="input-label">Nearest Landmark</label>
                  <input className="input-field" value={form.address.landmark} onChange={e => setField('address.landmark', e.target.value)} placeholder="e.g. Near Koramangala Metro" />
                </div>
                <div>
                  <label className="input-label">Pincode *</label>
                  <input className="input-field" value={form.address.pincode} onChange={e => setField('address.pincode', e.target.value)} placeholder="560034" required />
                </div>
                <div>
                  <label className="input-label">Google Maps Link</label>
                  <input className="input-field" value={form.address.googleMapsLink} onChange={e => setField('address.googleMapsLink', e.target.value)} placeholder="https://maps.google.com/..." />
                </div>
              </div>
            )}

            {/* Step 2: Rooms */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="font-bold text-gray-900 text-lg mb-4">Rooms & Pricing</h2>
                {form.rooms.map((room, idx) => (
                  <div key={idx} className="border border-gray-100 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900 text-sm">Room {idx + 1}</h3>
                      {form.rooms.length > 1 && <button onClick={() => removeRoom(idx)} className="text-red-500 text-xs font-semibold">Remove</button>}
                    </div>
                    <div>
                      <label className="input-label">Room Type</label>
                      <select className="input-field" value={room.type} onChange={e => setRoom(idx, 'type', e.target.value)}>
                        <option value="single">Single Occupancy</option>
                        <option value="double">Double Sharing</option>
                        <option value="triple">Triple Sharing</option>
                        <option value="dormitory">Dormitory</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="input-label">Price/mo (₹)</label>
                        <input type="number" className="input-field" value={room.price} onChange={e => setRoom(idx, 'price', e.target.value)} placeholder="10000" />
                      </div>
                      <div>
                        <label className="input-label">Deposit (₹)</label>
                        <input type="number" className="input-field" value={room.securityDeposit} onChange={e => setRoom(idx, 'securityDeposit', e.target.value)} placeholder="10000" />
                      </div>
                      <div>
                        <label className="input-label">Total Beds</label>
                        <input type="number" className="input-field" value={room.totalBeds} onChange={e => setRoom(idx, 'totalBeds', e.target.value)} placeholder="5" />
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addRoom} className="btn-secondary w-full">+ Add Another Room Type</button>
              </div>
            )}

            {/* Step 3: Amenities */}
            {step === 3 && (
              <div>
                <h2 className="font-bold text-gray-900 text-lg mb-4">Property Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {AMENITY_LIST.map(key => (
                    <button key={key} type="button"
                      onClick={() => setField('amenities', { ...form.amenities, [key]: !form.amenities[key] })}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all capitalize text-left ${form.amenities[key] ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Photos */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="font-bold text-gray-900 text-lg mb-4">Photos & Final Review</h2>
                <ImageUploadZone images={form.images} onChange={imgs => setField('images', imgs)} maxImages={10} />
                <div className="bg-amber-50 rounded-xl p-4 text-sm text-amber-700">
                  <strong>Before submitting:</strong> Ensure your description is accurate, pricing is correct, and all photos show the actual property. Our team will verify everything before approval.
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
              <button onClick={() => setStep(s => s - 1)} disabled={step === 0} className="btn-secondary disabled:opacity-30">
                Back
              </button>
              {step < STEPS.length - 1 ? (
                <button onClick={() => setStep(s => s + 1)} className="btn-primary">
                  Continue
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
                  {submitting ? 'Submitting…' : 'Submit Application'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
