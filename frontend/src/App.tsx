import { Routes, Route, Navigate } from 'react-router-dom';

// Public pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ImpactDashboard from './pages/ImpactDashboard';
import PrivacyPolicy from './pages/PrivacyPolicy';

// Admin pages
import AdminDashboard from './pages/AdminDashboard';
import Donors from './pages/admin/Donors';
import CaseloadInventory from './pages/admin/CaseloadInventory';
import ProcessRecording from './pages/admin/ProcessRecording';
import HomeVisits from './pages/admin/HomeVisits';
import Reports from './pages/admin/Reports';

function App() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<HomePage />} />
      <Route path="/impact" element={<ImpactDashboard />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />

      {/* Admin pages */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/donors" element={<Donors />} />
      <Route path="/admin/caseload" element={<CaseloadInventory />} />
      <Route path="/admin/process-recording" element={<ProcessRecording />} />
      <Route path="/admin/home-visits" element={<HomeVisits />} />
      <Route path="/admin/reports" element={<Reports />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
