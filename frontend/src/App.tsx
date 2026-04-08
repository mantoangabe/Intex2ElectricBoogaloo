import { Routes, Route, Navigate } from 'react-router-dom';

// Public pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DonorImpact from './pages/donor/DonorImpact';
import DonorDashboard from './pages/donor/DonorDashboard';
import PrivacyPolicy from './pages/PrivacyPolicy';

// Admin pages
import AdminDashboard from './pages/AdminDashboard';
import Donors from './pages/admin/Donors';
import CaseloadInventory from './pages/admin/CaseloadInventory';
import ProcessRecording from './pages/admin/ProcessRecording';
import HomeVisits from './pages/admin/HomeVisits';
import Reports from './pages/admin/Reports';
import RequireAdmin from './components/RequireAdmin';

function App() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<HomePage />} />
      <Route path="/donor" element={<DonorImpact />} />
      <Route path="/donor/dashboard" element={<DonorDashboard />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />

      {/* Admin pages */}
      <Route path="/admin/dashboard" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
      <Route path="/admin/donors" element={<RequireAdmin><Donors /></RequireAdmin>} />
      <Route path="/admin/caseload" element={<RequireAdmin><CaseloadInventory /></RequireAdmin>} />
      <Route path="/admin/process-recording" element={<RequireAdmin><ProcessRecording /></RequireAdmin>} />
      <Route path="/admin/home-visits" element={<RequireAdmin><HomeVisits /></RequireAdmin>} />
      <Route path="/admin/reports" element={<RequireAdmin><Reports /></RequireAdmin>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
