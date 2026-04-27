import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';

const VerifyEmail = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { verifyEmail, resendOtp } = useAuth();
  const { addToast } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      return addToast('error', 'Invalid OTP', 'Please enter the 6-digit code sent to your email.');
    }

    setLoading(true);
    try {
      await verifyEmail(email, otp);
      addToast('success', 'Email Verified!', 'Your account is now active. Welcome to Velto Stay!');
      navigate('/dashboard');
    } catch (err) {
      addToast('error', 'Verification Failed', err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendOtp(email);
      addToast('success', 'OTP Resent', `A new verification code has been sent to ${email}`);
    } catch (err) {
      addToast('error', 'Resend Failed', err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex flex-col justify-center bg-gray-50 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-8 shadow-modal rounded-3xl border border-gray-100 slide-up">
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Verify Your Email</h2>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              We've sent a 6-digit verification code to <br/>
              <span className="font-bold text-gray-900">{email}</span>
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Enter 6-Digit Code"
              type="text"
              maxLength="6"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="text-center text-2xl tracking-[0.5em] font-bold"
            />

            <Button
              type="submit"
              className="w-full"
              loading={loading}
            >
              Verify & Continue
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Didn't receive the code?{' '}
              <button 
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="font-bold text-primary-500 hover:text-primary-600 transition-colors disabled:opacity-50"
              >
                {resending ? 'Resending...' : 'Resend OTP'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;