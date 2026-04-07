import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: 'sans-serif', color: '#1a1a2e' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1rem 2rem', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        position: 'sticky', top: 0, zIndex: 10
      }}>
        <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>SafeHaven PH</span>
        <button
          onClick={() => navigate('/login')}
          style={{
            background: '#2d6a4f', color: '#fff', border: 'none',
            padding: '0.5rem 1.25rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600
          }}
        >
          Staff Login
        </button>
      </nav>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #2d6a4f 0%, #40916c 100%)',
        color: '#fff', padding: '5rem 2rem', textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2.75rem', marginBottom: '1rem' }}>
          Restoring Hope, Rebuilding Lives
        </h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 2rem', opacity: 0.9 }}>
          We provide safe shelter, healing programs, and reintegration support
          for survivors of trafficking and abuse across the Philippines.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button style={{
            background: '#fff', color: '#2d6a4f', border: 'none',
            padding: '0.75rem 1.75rem', borderRadius: '6px', cursor: 'pointer',
            fontWeight: 700, fontSize: '1rem'
          }}>
            Support Our Mission
          </button>
          <button style={{
            background: 'transparent', color: '#fff',
            border: '2px solid #fff', padding: '0.75rem 1.75rem',
            borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '1rem'
          }}>
            Learn More
          </button>
        </div>
      </section>

      {/* Impact numbers */}
      <section style={{ padding: '3rem 2rem', background: '#f9f9f9', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '2rem', fontSize: '1.75rem' }}>Our Impact</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
          {[
            { number: '500+', label: 'Residents Served' },
            { number: '12', label: 'Active Safehouses' },
            { number: '87%', label: 'Reintegration Rate' },
            { number: '200+', label: 'Partner Organizations' },
          ].map((stat) => (
            <div key={stat.label}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#2d6a4f' }}>{stat.number}</div>
              <div style={{ color: '#555', marginTop: '0.25rem' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section style={{ padding: '3rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>About Us</h2>
        <p style={{ lineHeight: 1.7, color: '#444' }}>
          SafeHaven PH is a non-governmental organization dedicated to protecting and
          empowering vulnerable women and children in the Philippines. Operating under
          the guidelines of the Department of Social Welfare and Development (DSWD),
          we provide comprehensive care spanning shelter, psychosocial support,
          education, livelihood training, and family reintegration services.
        </p>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#1a1a2e', color: '#aaa',
        textAlign: 'center', padding: '1.5rem'
      }}>
        <p>&copy; {new Date().getFullYear()} SafeHaven PH. All rights reserved.</p>
      </footer>
    </div>
  );
}
