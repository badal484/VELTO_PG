import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useNotifications } from '../../context/NotificationContext';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';

const ResetPassword = () => {
  const [formData, setFormData] = useState({ otp: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const { addToast } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  useEffect(() => {
    if (!email) navigate('/forgot-password');
  }, [email, navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return addToast('error', 'Error', 'Passwords do not match');
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email,
        otp: formData.otp,
        password: formData.password
      });
      addToast('success', 'Success', 'Password has been reset successfully. Please log in.');
      navigate('/login');
    } catch (err) {
      addToast('error', 'Error', err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex flex-col justify-center bg-gray-50 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-8 shadow-modal rounded-3xl border border-gray-100 slide-up">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Set New Password</h2>
            <p className="text-sm text-gray-500 mt-2">Enter the OTP sent to {email} and your new password.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="OTP Code"
              name="otp"
              required
              value={formData.otp}
              onChange={handleChange}
              placeholder="000000"
            />

            <Input
              label="New Password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
            />

            <Input
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
            />

            <Button
              type="submit"
              className="w-full mt-6"
              loading={loading}
            >
              Reset Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
