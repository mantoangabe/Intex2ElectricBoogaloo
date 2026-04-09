import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import '../styles/Navbar.css';

const publicNavLinks = [
  { label: 'Home', path: '/' },
  { label: 'Impact', path: '/donor' },
  { label: 'Donate', path: '/donor/dashboard' },
];

interface NavbarProps {
  title?: string;
}

export default function Navbar({ title }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, isAuthenticated, logout } = useAuth();
  const isAdminLayout = title !== undefined;

  const visiblePublicLinks = publicNavLinks.filter((link) =>
    link.path === '/donor/dashboard' ? isAuthenticated && !isAdmin : true,
  );
  const navLinks = isAdmin ? [...visiblePublicLinks, { label: 'Admin', path: '/admin/dashboard' }] : visiblePublicLinks;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (isAdminLayout) {
    return (
      <header className="admin-header">
        <h1 className="admin-header-title">
          <span className="admin-title-full">{title}</span>
          <span className="admin-title-short">River of Life</span>
        </h1>
        <div className="admin-header-actions">
          {navLinks.map(link => (
            <a
              key={link.path}
              className="admin-header-nav-link"
              onClick={() => navigate(link.path)}
              style={{
                fontWeight: location.pathname.startsWith(link.path) && (link.path !== '/' || location.pathname === '/') ? 700 : 400,
              }}
            >
              {link.label}
            </a>
          ))}
          <button
            className="hamburger-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
        {menuOpen && (
          <nav className="admin-mobile-menu">
            {navLinks.map(link => (
              <a
                key={link.path}
                className="admin-mobile-menu-link"
                onClick={() => {
                  navigate(link.path);
                  setMenuOpen(false);
                }}
                style={{
                  fontWeight: location.pathname.startsWith(link.path) && (link.path !== '/' || location.pathname === '/') ? 700 : 400,
                }}
              >
                {link.label}
              </a>
            ))}
            <a
              className="admin-mobile-menu-link"
              onClick={() => {
                handleLogout();
                setMenuOpen(false);
              }}
            >
              Logout
            </a>
          </nav>
        )}
      </header>
    );
  }

  return (
    <nav className="navbar">
      <span className="navbar-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        River of Life
      </span>

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
        {isAuthenticated ? (
          <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }} onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }} onClick={() => navigate('/login')}>
            Login
          </button>
        )}
      </div>

      <button
        className="hamburger-btn navbar-hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {menuOpen && (
        <div className="navbar-mobile-menu">
          {navLinks.map(link => (
            <a
              key={link.path}
              className="navbar-mobile-menu-link"
              onClick={() => {
                navigate(link.path);
                setMenuOpen(false);
              }}
            >
              {link.label}
            </a>
          ))}
          {isAuthenticated ? (
            <a
              className="navbar-mobile-menu-link"
              onClick={() => {
                handleLogout();
                setMenuOpen(false);
              }}
            >
              Logout
            </a>
          ) : (
            <a
              className="navbar-mobile-menu-link"
              onClick={() => {
                navigate('/login');
                setMenuOpen(false);
              }}
            >
              Login
            </a>
          )}
        </div>
      )}
    </nav>
  );
}
