import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Navbar.css';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Impact', path: '/donor' },
  { label: 'Donate', path: '/donor/dashboard' },
  { label: 'Admin', path: '/admin/dashboard' },
];

interface NavbarProps {
  title?: string;
}

export default function Navbar({ title }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = title !== undefined;

  if (isAdmin) {
    return (
      <header className="admin-header">
        <h1 style={{ margin: 0, fontSize: '1.2rem' }}>{title}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {navLinks.map(link => (
            <a
              key={link.path}
              onClick={() => navigate(link.path)}
              style={{
                cursor: 'pointer',
                textDecoration: 'none',
                color: 'rgba(255,255,255,0.85)',
                fontWeight: location.pathname.startsWith(link.path) && (link.path !== '/' || location.pathname === '/') ? 700 : 400,
              }}
            >
              {link.label}
            </a>
          ))}
          <button className="logout-btn" onClick={() => navigate('/')}>Logout</button>
        </div>
      </header>
    );
  }

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <span className="navbar-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          SafeHaven PH
        </span>
      </div>

      <div className="navbar-links">
        {navLinks.map(link => (
          <a
            key={link.path}
            onClick={() => navigate(link.path)}
            style={{ cursor: 'pointer', textDecoration: 'none' }}
          >
            {link.label}
          </a>
        ))}
        <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }} onClick={() => navigate('/login')}>
          Staff Login
        </button>
      </div>
    </nav>
  );
}
