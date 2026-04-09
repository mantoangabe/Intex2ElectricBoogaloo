import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Navbar from '../components/Navbar';
import jumpImage from '../assets/jump.jpg';
import '../styles/HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleDonateClick = () => {
    if (isAuthenticated) {
      navigate('/donor/dashboard');
      return;
    }

    navigate('/login', {
      state: {
        prompt: 'Please sign in to donate.',
      },
    });
  };

  return (
    <div className="home">
      <Navbar />

      <section
        className="hero-section"
        style={{ '--hero-bg': `url(${jumpImage})` } as React.CSSProperties}
      >
        <h1>Restoring Hope, Rebuilding Lives</h1>
        <div className="hero-buttons">
          <button className="btn btn-primary" onClick={handleDonateClick}>Support Our Mission</button>
          <button className="btn btn-outline" onClick={() => navigate('/donor')}>View Our Impact</button>
        </div>
      </section>

      <section className="about-section">
        <h2>About Us</h2>
        <p>
          River of Life is a non-governmental organization dedicated to protecting and
          empowering vulnerable women and children in the Philippines. Operating under
          the guidelines of the Department of Social Welfare and Development (DSWD),
          we provide comprehensive care spanning shelter, psychosocial support,
          education, livelihood training, and family reintegration services.
        </p>
      </section>

      <section className="how-help-section">
        <h2>How You Can Help</h2>
        <p>
          Your support makes a direct impact on the lives of survivors. Whether through financial donations,
          volunteering your time, or advocating for awareness, every contribution strengthens our ability to
          provide shelter, healing programs, and reintegration services. Together, we can create lasting change
          and restore hope to those who need it most.
        </p>
      </section>

      <section className="location-section">
        <h2>Where We Are Based</h2>
        <p>
          We are headquartered in Brazil, where our international team collaborates with local partners
          to support survivors across multiple regions. Our network extends to the Philippines and beyond,
          allowing us to provide culturally sensitive and locally-informed care to vulnerable populations
          in underserved communities worldwide.
        </p>
      </section>

      <footer className="footer">
        <p>
          &copy; {new Date().getFullYear()} River of Life. All rights reserved. | <a href="/privacy">Privacy Policy</a> |{' '}
          <a href="/cookies">Cookie Policy</a>
        </p>
      </footer>
    </div>
  );
}
