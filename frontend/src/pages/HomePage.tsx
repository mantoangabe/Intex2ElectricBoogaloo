import Navbar from '../components/Navbar';
import '../styles/HomePage.css';

export default function HomePage() {
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
          <button className="btn btn-primary" onClick={() => navigate('/donor/dashboard')}>Support Our Mission</button>
          <button className="btn btn-outline" onClick={() => navigate('/donor')}>View Our Impact</button>
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
