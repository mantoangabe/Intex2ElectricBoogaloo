import { useNavigate } from 'react-router-dom';
import '../styles/styles.css';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <nav className="navbar">
        <span className="navbar-brand">SafeHaven PH</span>
        <div className="navbar-links">
          <a href="/">Home</a>
          <a href="/impact">Impact</a>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/login')}
            style={{ marginLeft: '1rem', padding: '0.5rem 1.25rem' }}
          >
            Staff Login
          </button>
        </div>
      </nav>

      <main style={{ flex: 1, padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ color: 'var(--text)' }}>Privacy Policy</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Last updated: April 6, 2026
        </p>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--text)', marginTop: 0 }}>1. Introduction</h2>
          <p style={{ color: 'var(--text)', lineHeight: 1.7 }}>
            SafeHaven PH ("we", "us", "our", or "Company") is committed to protecting your privacy. This Privacy Policy explains
            how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--text)', marginTop: 0 }}>2. Information We Collect</h2>
          <p style={{ color: 'var(--text)', lineHeight: 1.7 }}>
            We may collect information about you in a variety of ways. The information we may collect on the Site includes:
          </p>
          <ul style={{ color: 'var(--text)', lineHeight: 1.7 }}>
            <li><strong>Personal Data:</strong> Name, email address, phone number, and authentication credentials.</li>
            <li><strong>Device Information:</strong> Browser type, IP address, and access times.</li>
            <li><strong>Usage Data:</strong> Pages accessed, time spent on pages, and referral sources.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--text)', marginTop: 0 }}>3. Use of Your Information</h2>
          <p style={{ color: 'var(--text)', lineHeight: 1.7 }}>
            Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience.
            Specifically, we may use information collected about you via the Site to:
          </p>
          <ul style={{ color: 'var(--text)', lineHeight: 1.7 }}>
            <li>Generate a personal profile about you so that future visits to the Site are customized to your preferences.</li>
            <li>Increase the efficiency and operation of the Site.</li>
            <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
            <li>Notify you of updates to the Site.</li>
            <li>Process transactions and send related information.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--text)', marginTop: 0 }}>4. Disclosure of Your Information</h2>
          <p style={{ color: 'var(--text)', lineHeight: 1.7 }}>
            We may share information we have collected about you in certain situations:
          </p>
          <ul style={{ color: 'var(--text)', lineHeight: 1.7 }}>
            <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information is necessary to comply with the law.</li>
            <li><strong>Service Providers:</strong> We may share your information with third parties who perform services for us.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--text)', marginTop: 0 }}>5. Security of Your Information</h2>
          <p style={{ color: 'var(--text)', lineHeight: 1.7 }}>
            We use administrative, technical, and physical security measures to protect your personal information. However, perfect
            security cannot be guaranteed on the Internet.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--text)', marginTop: 0 }}>6. Contact Us</h2>
          <p style={{ color: 'var(--text)', lineHeight: 1.7 }}>
            If you have questions or comments about this Privacy Policy, please contact us at:{' '}
            <a href="mailto:privacy@safehavenph.org" style={{ color: 'var(--primary)' }}>
              privacy@safehavenph.org
            </a>
          </p>
        </section>

        <section style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: 'var(--highlight)', borderRadius: '6px' }}>
          <h3 style={{ color: 'var(--text)', marginTop: 0 }}>GDPR & Cookie Consent</h3>
          <p style={{ color: 'var(--text)', margin: 0 }}>
            We use cookies to enhance your browsing experience. By continuing to use this site, you consent to our use of cookies
            in accordance with our Privacy Policy. You can modify your cookie settings at any time through your browser preferences.
          </p>
        </section>
      </main>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} SafeHaven PH. All rights reserved.</p>
      </footer>
    </div>
  );
}
