import '../../../styles/marketing.css';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Footer';

export const metadata = {
  title: 'Privacy Policy — HireDax',
};

export default function PrivacyPage() {
  return (
    <div className="mkt-page">
      <Header />

      <main className="mkt-legal-main">
        <div className="mkt-legal-card">

          <h1 className="mkt-legal-title">Privacy Policy</h1>
          <p className="mkt-legal-date">Effective Date: June 09, 2026</p>

          <p className="mkt-legal-p">
            We value your privacy and make every effort to respect your wishes and personal
            information. Please read this policy carefully to understand how we collect, use,
            and manage your phone numbers.
          </p>

          <h2 className="mkt-legal-section">Collection of Phone Numbers</h2>
          <p className="mkt-legal-p">
            We collect your phone numbers only when you voluntarily provide them to us, for
            example, during transactions, inquiries, or when you sign up to receive notification
            messages. You can opt in to receive these SMS messages by providing your phone number.
          </p>

          <h2 className="mkt-legal-section">Use of Phone Numbers for SMS</h2>
          <p className="mkt-legal-p">
            SMS messaging charges may be applied by your carrier. We will only share your phone
            number with our SMS provider, subject to their privacy policy.
          </p>

          <h2 className="mkt-legal-section">Opting Out of Messages</h2>
          <p className="mkt-legal-p">
            If at any time you wish to stop receiving messages from us, you can opt out by
            texting STOP.
          </p>

          <h2 className="mkt-legal-section">Privacy of Phone Numbers</h2>
          <p className="mkt-legal-p">
            Once you have opted out, we will not send you any more SMS messages, nor will we
            sell or transfer your phone number to another party.
          </p>

          <h2 className="mkt-legal-section">Changes to This Policy</h2>
          <p className="mkt-legal-p">
            We may periodically update this policy. We will notify you about significant changes
            in the way we treat your information by placing a prominent notice on our site. We
            thank you for your understanding and cooperation. If you have any questions or
            concerns about this policy, please feel free to contact us via the form on our site.
          </p>

          <h2 className="mkt-legal-section">Information We Collect</h2>
          <p className="mkt-legal-p">
            When you use HireDax, we may collect the following types of information: information
            you provide directly (name, email address, business name, phone number); usage data
            (pages visited, features used, time spent); device and browser information (IP
            address, browser type, operating system); and communications data (messages sent
            through the platform).
          </p>

          <h2 className="mkt-legal-section">How We Use Your Information</h2>
          <p className="mkt-legal-p">
            We use collected information to provide and improve the HireDax service; send
            transactional SMS messages related to job estimates and bookings; respond to support
            requests; analyze usage patterns to improve the product; and comply with legal
            obligations.
          </p>

          <h2 className="mkt-legal-section">Data Storage and Security</h2>
          <p className="mkt-legal-p">
            Your data is stored on Google Cloud infrastructure with industry-standard encryption
            at rest and in transit. We implement appropriate technical and organizational measures
            to protect your personal information against unauthorized access, alteration,
            disclosure, or destruction.
          </p>

          <h2 className="mkt-legal-section">Third-Party Services</h2>
          <p className="mkt-legal-p">
            HireDax uses the following third-party services that may receive your data: Google
            Firebase (authentication and database); Surge.app (SMS delivery); Vapi (voice AI
            infrastructure); and Google Cloud (hosting and AI services). Each third-party service
            operates under its own privacy policy.
          </p>

          <h2 className="mkt-legal-section">Your Rights</h2>
          <p className="mkt-legal-p">
            You have the right to access the personal data we hold about you; request correction
            of inaccurate data; request deletion of your data; opt out of SMS communications at
            any time by texting STOP; and contact us with privacy questions at{' '}
            <a href="mailto:team@amazing.ai" className="mkt-legal-link">team@amazing.ai</a>.
          </p>

          <h2 className="mkt-legal-section">Contact Us</h2>
          <p className="mkt-legal-p">
            AmazingDotAi, LLC DBA HireDax<br />
            Email:{' '}
            <a href="mailto:team@amazing.ai" className="mkt-legal-link">team@amazing.ai</a><br />
            Website:{' '}
            <a href="https://www.hiredax.com" className="mkt-legal-link">https://www.hiredax.com</a>
          </p>

        </div>
      </main>

      <Footer />
    </div>
  );
}
