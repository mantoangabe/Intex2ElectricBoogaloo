import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <nav className="navbar">
        <span className="navbar-brand">SafeHaven PH</span>
        <button className="navbar-btn" onClick={() => navigate('/login')}>
          Staff Login
        </button>
      </nav>

      <section className="hero-section">
        <h1>Restoring Hope, Rebuilding Lives</h1>
        <p>
          We provide safe shelter, healing programs, and reintegration support
          for survivors of trafficking and abuse across the Philippines.
        </p>
        <div className="hero-buttons">
          <button className="btn btn-primary" onClick={() => navigate('/donor/dashboard')}>Support Our Mission</button>
          <button className="btn btn-outline" onClick={() => navigate('/donor')}>View Our Impact</button>
        </div>
      </section>

      <section className="impact-section">
        <h2>Our Impact</h2>
        <div className="stats-grid">
          {[
            { number: '500+', label: 'Residents Served' },
            { number: '12', label: 'Active Safehouses' },
            { number: '87%', label: 'Reintegration Rate' },
            { number: '200+', label: 'Partner Organizations' },
          ].map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="about-section">
        <h2>About Us</h2>
        <p>
          SafeHaven PH is a non-governmental organization dedicated to protecting and
          empowering vulnerable women and children in the Philippines. Operating under
          the guidelines of the Department of Social Welfare and Development (DSWD),
          we provide comprehensive care spanning shelter, psychosocial support,
          education, livelihood training, and family reintegration services.
        </p>
      </section>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} SafeHaven PH. All rights reserved.</p>
      </footer>
    </div>
  );
}
