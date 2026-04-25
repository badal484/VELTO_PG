import React from 'react';
import { useAuth } from '../../context/AuthContext';
import StarRating from '../common/StarRating';

const RESIDENT_TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Software Engineer at Wipro', rating: 5, text: 'Found my perfect PG in Koramangala within 30 minutes! The booking process was seamless and the property was exactly as shown. No surprises, no brokerages.', avatar: 'PS' },
  { name: 'Rahul Mehta', role: 'Student at IIM Bangalore', rating: 5, text: 'Velto Stay saved me weeks of searching. The map view made it super easy to find a PG close to my college. Highly recommend for anyone moving to Bangalore!', avatar: 'RM' },
  { name: 'Aisha Khan', role: 'Consultant at Deloitte', rating: 5, text: "The refund policy is transparent and they actually follow it. When I had to cancel, the money was back in 3 days. That's rare in the PG industry.", avatar: 'AK' },
];

const OWNER_TESTIMONIALS = [
  { name: 'Suresh Reddy', role: 'Owner, Sai Comforts', rating: 5, text: "Since joining Velto Stay, my occupancy has stayed at 95%+. The automated monthly payouts and guest verification have completely removed the stress of property management.", avatar: 'SR' },
  { name: 'Meera Iyer', role: 'Property Manager, Nest Homes', rating: 5, text: "The owner dashboard is a game changer. I can track revenue and manage multiple locations from my phone. It's the most professional platform in Bangalore right now.", avatar: 'MI' },
  { name: 'Vikram Singh', role: 'Owner, Royal Stays', rating: 5, text: "The walk-in booking feature is incredibly helpful. I can record offline residents and keep my inventory updated in real-time. Transparent, efficient, and reliable.", avatar: 'VS' },
];

export default function Testimonials() {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';
  const data = isOwner ? OWNER_TESTIMONIALS : RESIDENT_TESTIMONIALS;

  return (
    <section className="py-24 bg-gray-50">
      <div className="page-container">
        <div className="text-center mb-14">
          <span className="text-xs font-bold text-primary-500 uppercase tracking-[0.2em] mb-3 block">
            {isOwner ? 'Partner Success Stories' : 'Resident Stories'}
          </span>
          <h2 className="section-title">
            {isOwner ? 'What Our Partners Say' : 'What Our Residents Say'}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.map(t => (
            <div key={t.name} className="card p-6">
              <StarRating value={t.rating} size="sm" />
              <p className="text-gray-600 text-sm leading-relaxed mt-4 mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm flex-shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
