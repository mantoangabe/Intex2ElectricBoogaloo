import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Navbar from '../components/Navbar';
import handsImage from '../assets/Hands.jpg';
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

      <section className="hero-section">
        <h1>Restoring Hope, Rebuilding Lives</h1>
        <p>
          We provide safe shelter, healing programs, and reintegration support
          for survivors of trafficking and abuse across the Philippines.
        </p>
        <div className="hero-buttons">
          <button className="btn btn-primary" onClick={handleDonateClick}>Support Our Mission</button>
          <button className="btn btn-outline" onClick={() => navigate('/donor')}>View Our Impact</button>
        </div>
      </section>

      <section className="image-section">
        <img src={handsImage} alt="girls walking down a hallway" />
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

      <footer className="footer">
        <p>
          &copy; {new Date().getFullYear()} River of Life. All rights reserved. | <a href="/privacy">Privacy Policy</a> |{' '}
          <a href="/cookies">Cookie Policy</a>
        </p>
      </footer>
    </div>
  );
}
