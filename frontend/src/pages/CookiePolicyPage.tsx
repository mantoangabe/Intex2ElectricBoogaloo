import Navbar from '../components/Navbar';
import '../styles/styles.css';

export default function CookiePolicyPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ color: 'var(--text)' }}>Cookie Policy</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Last updated: April 8, 2026
        </p>

        <h2 className="h3 mb-3">Cookie Policy</h2>
        <p className="text-muted">
          This teaching app uses a small set of essential cookies to keep authentication and external-login flows working.
        </p>

        <h3 className="h5 mt-4">Essential cookies used by this app</h3>
        <ul>
          <li>
            The ASP.NET Core Identity application cookie keeps the user signed in after a successful local or external login.
          </li>
          <li>
            Correlation and nonce cookies may be set briefly during external authentication handshakes to prevent replay and forgery.
          </li>
          <li>
            Anti-forgery related state values may be stored where applicable to protect secure form submissions.
          </li>
        </ul>

        <h3 className="h5 mt-4">Why these cookies are required</h3>
        <p>
          These cookies are strictly necessary for account security and session management. Without them, sign-in and protected-route
          access cannot function correctly.
        </p>

        <h3 className="h5 mt-4">Managing cookies</h3>
        <p>
          You can clear cookies in your browser at any time. Clearing essential cookies may sign you out and interrupt authentication
          flows.
        </p>
      </main>

      <footer className="footer">
        <p>
          &copy; {new Date().getFullYear()} SafeHaven PH. All rights reserved. | <a href="/privacy">Privacy Policy</a> |{' '}
          <a href="/cookies">Cookie Policy</a>
        </p>
      </footer>
    </div>
  );
}
