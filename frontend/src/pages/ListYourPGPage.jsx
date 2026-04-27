import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SEOHead from '../components/common/SEOHead';
import { CheckCircle, ShieldCheck, Zap, BarChart3, ArrowRight, Home, IndianRupee, Star } from 'lucide-react';

const BENEFITS = [
  { title: 'Zero Upfront Cost', desc: 'List your property for free. We only earn when you earn — a small commission per booking.', icon: Zap, color: 'bg-amber-500' },
  { title: 'Instant Payments', desc: 'Receive monthly payouts directly to your bank account, fully automated and transparent.', icon: IndianRupee, color: 'bg-emerald-500' },
  { title: 'Advanced Dashboard', desc: 'Track bookings, revenue, occupancy rates, and resident reviews from one powerful place.', icon: BarChart3, color: 'bg-blue-500' },
  { title: 'Verified Status', desc: 'Approved properties get a "Verified" badge, significantly increasing trust and bookings.', icon: ShieldCheck, color: 'bg-indigo-500' },
];

const STEPS = [
  { title: 'Submit Application', desc: 'Tell us about your PG, upload photos, and set your desired pricing structure.' },
  { title: 'Physical Inspection', desc: 'Our quality team will visit your property to verify safety and service standards.' },
  { title: 'Go Live & Earn', desc: 'Your listing goes live instantly! Start receiving confirmed bookings and monthly payouts.' }
];

export default function ListYourPGPage() {
  const { user } = useAuth();

  React.useEffect(() => {
    if (user?.role === 'owner') {
      window.location.href = '/partner/apply';
    }
  }, [user]);

  return (
    <>
      <SEOHead title="List Your PG — Partner with Velto Stay" description="Join Bangalore's most trusted PG platform. Get more bookings, automated payments, and professional property management tools." />
      
      <div className="bg-white">
        {/* Premium Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-primary-50/50 -skew-x-12 translate-x-1/4 -z-10" />
          <div className="absolute top-20 right-20 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -z-10 animate-pulse" />
          
          <div className="page-container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="slide-up">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-xs font-bold uppercase tracking-wider mb-6">
                  <Star className="w-3 h-3 fill-current" />
                  Become a Partner
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-[1.1] mb-6">
                  Maximize Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-700">PG Revenue</span> with Velto Stay.
                </h1>
                <p className="text-lg text-gray-600 mb-10 leading-relaxed max-w-xl">
                  Join 150+ property owners in Bangalore who trust Velto Stay to fill their rooms, automate their payments, and manage their residents effortlessly.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to={user ? '/partner/apply' : '/register'} className="btn-primary text-base px-8 py-4 flex items-center justify-center gap-2 shadow-xl shadow-primary-500/20">
                    Get Started for Free
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="flex -space-x-2">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                          <img src={`https://i.pravatar.cc/100?u=${i+10}`} alt="Owner" />
                        </div>
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-gray-700">150+ Owners Joined</span>
                  </div>
                </div>
              </div>

              <div className="relative slide-up delay-100 hidden lg:block">
                <div className="relative z-10 bg-white rounded-[2.5rem] p-4 shadow-2xl shadow-primary-900/10 border border-white/20 backdrop-blur-xl">
                  <img 
                    src="https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&q=80&w=1000" 
                    alt="Modern PG Room" 
                    className="rounded-[2rem] w-full h-[500px] object-cover"
                  />
                  <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl border border-gray-50 flex items-center gap-4 animate-bounce-slow">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white">
                      <IndianRupee className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Est. Monthly Earnings</p>
                      <p className="text-xl font-black text-gray-900">₹85,000+</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Benefits */}
        <section className="py-24 bg-white relative">
          <div className="page-container">
            <div className="text-center max-w-3xl mx-auto mb-16 slide-up">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything you need to succeed.</h2>
              <p className="text-gray-500 text-lg">We provide the tools, the technology, and the tenants. You provide the space.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {BENEFITS.map((b, i) => (
                <div key={b.title} className={`card p-8 group hover:shadow-2xl transition-all duration-300 slide-up delay-${i*100}`}>
                  <div className={`w-14 h-14 ${b.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                    <b.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{b.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Step-by-Step Process */}
        <section className="py-24 bg-gray-50 relative overflow-hidden">
          <div className="page-container relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="slide-up">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">Your journey to becoming<br />a Velto Partner.</h2>
                <div className="space-y-10 mt-12">
                  {STEPS.map((s, i) => (
                    <div key={s.title} className="flex gap-6">
                      <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-primary-500 font-black text-xl">
                        {i + 1}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h4>
                        <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-primary-500 rounded-[3rem] p-10 md:p-16 slide-up delay-200">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">Ready to list?</h3>
                <p className="text-primary-50 mb-10 text-lg">Our application takes less than 10 minutes. Once submitted, our team will reach out within 48 hours.</p>
                <Link to={user ? '/partner/apply' : '/register'} className="w-full bg-white text-primary-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-primary-50 transition-colors shadow-lg">
                  Start Application Now
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <div className="mt-8 flex items-center gap-4 text-primary-100 text-sm font-medium">
                  <CheckCircle className="w-5 h-5" /> No registration fee
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-300" />
                  <CheckCircle className="w-5 h-5" /> Cancel anytime
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section Placeholder/Metric */}
        <section className="py-24 bg-white border-t border-gray-100">
          <div className="page-container text-center slide-up">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">Trusted by owners across Bangalore</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { l: 'Beds Managed', v: '2,500+' },
                { l: 'Monthly Payouts', v: '₹1.2Cr+' },
                { l: 'Owner Rating', v: '4.8/5' },
                { l: 'Partner PGs', v: '150+' }
              ].map(m => (
                <div key={m.l}>
                  <p className="text-4xl font-black text-primary-500 mb-2">{m.v}</p>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{m.l}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}