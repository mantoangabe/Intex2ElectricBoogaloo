import { Routes, Route, Navigate } from 'react-router-dom';

// Public pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DonorImpact from './pages/donor/DonorImpact';
import DonorDashboard from './pages/donor/DonorDashboard';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CookiePolicyPage from './pages/CookiePolicyPage';
import CookieConsentBanner from './components/CookieConsentBanner';
import RequireAuth from './components/RequireAuth';
import RequireAdmin from './components/RequireAdmin';

// Admin pages
import AdminDashboard from './pages/AdminDashboard';
import Donors from './pages/admin/Donors';
import CaseloadInventory from './pages/admin/CaseloadInventory';
import ProcessRecording from './pages/admin/ProcessRecording';
import HomeVisits from './pages/admin/HomeVisits';
import Reports from './pages/admin/Reports';
import UserRoles from './pages/admin/UserRoles';

function App() {
  return (
    <>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/donor" element={<DonorImpact />} />
        <Route path="/donor/dashboard" element={<RequireAuth><DonorDashboard /></RequireAuth>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/cookies" element={<CookiePolicyPage />} />

        {/* Admin pages */}
        <Route path="/admin/dashboard" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
        <Route path="/admin/donors" element={<RequireAdmin><Donors /></RequireAdmin>} />
        <Route path="/admin/caseload" element={<RequireAdmin><CaseloadInventory /></RequireAdmin>} />
        <Route path="/admin/process-recording" element={<RequireAdmin><ProcessRecording /></RequireAdmin>} />
        <Route path="/admin/home-visits" element={<RequireAdmin><HomeVisits /></RequireAdmin>} />
        <Route path="/admin/reports" element={<RequireAdmin><Reports /></RequireAdmin>} />
        <Route path="/admin/user-roles" element={<RequireAdmin><UserRoles /></RequireAdmin>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <CookieConsentBanner />
    </>
  );
}

export default App;
