import '../../styles/marketing.css';
import { Logo } from '@/components/ui';
import { WaitlistForm } from '@/components/marketing/WaitlistForm';
import { Footer } from '@/components/marketing/Footer';

export default function MarketingPage() {
  return (
    <div className="mkt-page">

      {/* NAV */}
      <nav className="mkt-nav">
        <div className="mkt-nav-inner">
          <Logo size="sm" theme="light" />
          <div className="mkt-nav-right">
            <span className="mkt-beta-label">Private Beta</span>
            <a href="/login" className="mkt-login-btn">Operator Login</a>
          </div>
        </div>
      </nav>

      {/* HERO + CARD */}
      <main className="mkt-hero">
        <div className="mkt-live-badge">
          <div className="mkt-live-dot" />
          Now in Private Beta
        </div>
        <h1 className="mkt-headline">
          You get the job done. We&apos;ll handle getting you more.
        </h1>
        <p className="mkt-subheadline">
          Capture leads, ask smart follow-up questions, generate estimates,
          and automatically book your next job while you stay in the truck.
        </p>
        <WaitlistForm />
      </main>

      {/* FOOTER */}
      <Footer />

    </div>
  );
}
