import { useCookieConsent } from '../context/CookieConsentContext';
import '../styles/CookieConsentBanner.css';

export default function CookieConsentBanner() {
  const { hasAcknowledgedConsent, acknowledgeConsent } = useCookieConsent();

  if (hasAcknowledgedConsent) return null;

  return (
    <aside className="cookie-consent-banner shadow-lg" role="dialog" aria-live="polite" aria-label="Cookie consent notice">
      <div className="cookie-consent-content">
        <p className="cookie-consent-title">Essential cookie notice</p>
        <p className="cookie-consent-copy">
          This app uses essential cookies for authentication and external login workflows. By continuing,
          you acknowledge the use of these required cookies.
        </p>
      </div>
      <button type="button" className="btn btn-warning fw-semibold" onClick={acknowledgeConsent}>
        Acknowledge essential cookies
      </button>
    </aside>
  );
}
