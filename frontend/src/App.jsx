import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { SocketProvider } from './context/SocketContext';
import ScrollToTop from './components/common/ScrollToTop';
import PageLoader from './components/common/PageLoader';
import ProtectedRoute from './components/common/ProtectedRoute';
import GuestRoute from './components/common/GuestRoute';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// ─── Public Pages ───────────────────────────────────────────────────────────
const HomePage            = lazy(() => import('./pages/HomePage'));
const ListingsPage        = lazy(() => import('./pages/ListingsPage'));
const PGDetailPage        = lazy(() => import('./pages/PGDetailPage'));
const ListYourPGPage      = lazy(() => import('./pages/ListYourPGPage'));
const SupportPage         = lazy(() => import('./pages/SupportPage'));
const NotFoundPage        = lazy(() => import('./pages/NotFoundPage'));

// ─── Auth Pages ──────────────────────────────────────────────────────────────
const LoginPage           = lazy(() => import('./pages/auth/Login'));
const RegisterPage        = lazy(() => import('./pages/auth/Register'));
const VerifyEmailPage     = lazy(() => import('./pages/auth/VerifyEmail'));
const ForgotPasswordPage  = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPasswordPage   = lazy(() => import('./pages/auth/ResetPassword'));

// ─── Protected User Pages ────────────────────────────────────────────────────
const DashboardPage       = lazy(() => import('./pages/DashboardPage'));
const BookingPage         = lazy(() => import('./pages/BookingPage'));
const BookingSuccessPage  = lazy(() => import('./pages/BookingSuccessPage'));

// ─── Protected Owner Pages ───────────────────────────────────────────────────
const OwnerDashboardPage      = lazy(() => import('./pages/OwnerDashboardPage'));
const PartnerApplicationPage  = lazy(() => import('./pages/PartnerApplicationPage'));

// ─── Admin Pages ─────────────────────────────────────────────────────────────
const AdminLayout         = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard      = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminApplications   = lazy(() => import('./pages/admin/AdminApplications'));
const AdminApplicationDetail = lazy(() => import('./pages/admin/AdminApplicationDetail'));
const AdminPGs            = lazy(() => import('./pages/admin/AdminPGs'));
const AdminUsers          = lazy(() => import('./pages/admin/AdminUsers'));
const AdminBookings       = lazy(() => import('./pages/admin/AdminBookings'));
const AdminPayouts        = lazy(() => import('./pages/admin/AdminPayouts'));
const AdminSupport        = lazy(() => import('./pages/admin/AdminSupport'));
const AdminAuditLog       = lazy(() => import('./pages/admin/AdminAuditLog'));

const ADMIN_ONLY = ['admin'];
const OWNER_ADMIN = ['owner', 'admin'];
const ALL_ROLES = ['user', 'owner', 'admin'];

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <NotificationProvider>
          <SocketProvider>
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* ── Admin (own layout, no shared navbar/footer) ── */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute roles={ADMIN_ONLY}>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="applications" element={<AdminApplications />} />
                  <Route path="applications/:id" element={<AdminApplicationDetail />} />
                  <Route path="pgs" element={<AdminPGs />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="bookings" element={<AdminBookings />} />
                  <Route path="payouts" element={<AdminPayouts />} />
                  <Route path="support" element={<AdminSupport />} />
                  <Route path="audit-log" element={<AdminAuditLog />} />
                </Route>

                {/* ── All other pages use shared Navbar + Footer ── */}
                <Route
                  path="*"
                  element={
                    <div className="flex flex-col min-h-screen">
                      <Navbar />
                      <main className="flex-grow">
                        <Routes>
                          {/* Public */}
                          <Route path="/" element={<HomePage />} />
                          <Route path="/listings" element={<ListingsPage />} />
                          <Route path="/pg/:id" element={<PGDetailPage />} />
                          <Route path="/list-your-pg" element={<ListYourPGPage />} />
                          <Route path="/support" element={<SupportPage />} />

                          {/* Auth (redirect if already logged in) */}
                          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
                          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
                          <Route path="/verify-email" element={<VerifyEmailPage />} />
                          <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
                          <Route path="/reset-password" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />

                          {/* Protected user */}
                          <Route path="/dashboard" element={<ProtectedRoute roles={ALL_ROLES}><DashboardPage /></ProtectedRoute>} />
                          <Route path="/booking/:pgId" element={<ProtectedRoute roles={ALL_ROLES}><BookingPage /></ProtectedRoute>} />
                          <Route path="/booking/success/:bookingId" element={<ProtectedRoute roles={ALL_ROLES}><BookingSuccessPage /></ProtectedRoute>} />

                          {/* Protected owner */}
                          <Route path="/owner/dashboard" element={<ProtectedRoute roles={OWNER_ADMIN}><OwnerDashboardPage /></ProtectedRoute>} />
                          <Route path="/partner/apply" element={<ProtectedRoute roles={ALL_ROLES}><PartnerApplicationPage /></ProtectedRoute>} />

                          {/* 404 */}
                          <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                      </main>
                      <Footer />
                    </div>
                  }
                />
              </Routes>
            </Suspense>
          </SocketProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
