import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import '../styles/styles.css';

interface AdminLayoutProps {
  title: string;
  children: React.ReactNode;
}

const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard' },
  { label: 'Caseload Inventory', path: '/admin/caseload' },
  { label: 'Process Recording', path: '/admin/process-recording' },
  { label: 'Home Visits', path: '/admin/home-visits' },
  { label: 'Donors & Contributions', path: '/admin/donors' },
  { label: 'Reports & Analytics', path: '/admin/reports' },
];

export default function AdminLayout({ title, children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="admin-container">
      <Navbar title={title} showLogout={true} />
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <nav>
            <ul className="admin-nav">
              {navItems.map((item) => (
                <li key={item.path} className="admin-nav-item">
                  <a
                    className={`admin-nav-link ${location.pathname === item.path ? 'active' : ''}`}
                    onClick={() => navigate(item.path)}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
