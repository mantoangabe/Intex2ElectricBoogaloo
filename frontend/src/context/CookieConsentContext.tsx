import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface CookieConsentContextValue {
  hasAcknowledgedConsent: boolean;
  acknowledgeConsent: () => void;
}

const cookieConsentStorageKey = 'cookie-consent-status';

const CookieConsentContext = createContext<CookieConsentContextValue | undefined>(undefined);

function getInitialConsentValue(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(cookieConsentStorageKey) === 'acknowledged';
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [hasAcknowledgedConsent, setHasAcknowledgedConsent] = useState<boolean>(() => getInitialConsentValue());

  const acknowledgeConsent = () => {
    window.localStorage.setItem(cookieConsentStorageKey, 'acknowledged');
    setHasAcknowledgedConsent(true);
  };

  const value = useMemo(
    () => ({ hasAcknowledgedConsent, acknowledgeConsent }),
    [hasAcknowledgedConsent]
  );

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>;
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error('useCookieConsent must be used within CookieConsentProvider');
  }
  return context;
}
