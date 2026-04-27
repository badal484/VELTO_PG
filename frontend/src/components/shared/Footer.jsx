import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="page-container">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="bg-primary-500 p-1.5 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-primary-500">
                Velto Stay
              </span>
            </Link>
            <p className="text-gray-500 text-sm max-w-sm leading-relaxed mb-6">
              The ultimate PG accommodation platform in Bangalore. We connect you with verified, premium stays instantly. Experience a hassle-free living experience today.
            </p>
            <div className="flex items-center gap-4">
              {['facebook', 'twitter', 'instagram', 'linkedin'].map(social => (
                <a key={social} href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-primary-50 hover:text-primary-500 transition-all">
                  <i className={`fab fa-${social}`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6">Company</h4>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-sm text-gray-600 hover:text-primary-500 transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="text-sm text-gray-600 hover:text-primary-500 transition-colors">Careers</Link></li>
              <li><Link to="/blog" className="text-sm text-gray-600 hover:text-primary-500 transition-colors">Blog</Link></li>
              <li><Link to="/contact" className="text-sm text-gray-600 hover:text-primary-500 transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-6">Explore</h4>
            <ul className="space-y-4">
              <li><Link to="/search?type=male" className="text-sm text-gray-600 hover:text-primary-500 transition-colors">Boys PGs</Link></li>
              <li><Link to="/search?type=female" className="text-sm text-gray-600 hover:text-primary-500 transition-colors">Girls PGs</Link></li>
              <li><Link to="/search?type=co-ed" className="text-sm text-gray-600 hover:text-primary-500 transition-colors">Co-ed PGs</Link></li>
              <li><Link to="/search?featured=true" className="text-sm text-gray-600 hover:text-primary-500 transition-colors">Featured Stays</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-6">Support</h4>
            <ul className="space-y-4">
              <li><Link to="/support" className="text-sm text-gray-600 hover:text-primary-500 transition-colors">Help Center</Link></li>
              <li><Link to="/terms" className="text-sm text-gray-600 hover:text-primary-500 transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-sm text-gray-600 hover:text-primary-500 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/refunds" className="text-sm text-gray-600 hover:text-primary-500 transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {currentYear} Velto Stay. Built with ❤️ for Bangalore.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">A Product of NexxBuyy</span>
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-bold text-gray-600">All Systems Operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;