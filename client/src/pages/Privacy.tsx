// FinesseOS — Privacy Policy
// ============================================================

import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';

const LAST_UPDATED = 'February 23, 2026';

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-black text-white tracking-tight mb-4 pb-2 border-b border-zinc-700">
        {title}
      </h2>
      <div className="text-zinc-300 text-sm leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#1a1918] text-white">
      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1a1918]/95 backdrop-blur-xl border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="https://files.manuscdn.com/user_upload_by_module/session_file/94821429/gUEtbVDJTcocGKPG.png"
              alt="FinesseOS"
              style={{ width: '32px', height: '32px', mixBlendMode: 'screen', filter: 'drop-shadow(0 0 6px rgba(96,165,250,0.6)) brightness(1.15)' }}
            />
            <span className="text-white font-black tracking-tighter">FinesseOS</span>
            <span className="text-zinc-400 font-mono text-xs">.pro</span>
          </Link>
          <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm transition-colors font-mono">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </nav>

      {/* ── Content ── */}
      <main className="max-w-4xl mx-auto px-6 pt-32 pb-24">
        <div className="mb-12">
          <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3 font-mono">Legal</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter mb-4">
            Privacy Policy
          </h1>
          <p className="text-zinc-400 text-sm font-mono">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 sm:p-12">

          <Section title="1. Introduction">
            <p>
              FinesseOS LLC ("we," "us," or "our") operates the FinesseOS platform at finesseos.pro (the "Service"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use the Service.
            </p>
            <p>
              By using the Service, you consent to the data practices described in this policy. If you do not agree, please discontinue use of the Service.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <p><strong className="text-white">Information you provide directly:</strong></p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Account registration data (name, email address)</li>
              <li>Affiliate links and URLs you submit for processing</li>
              <li>Payment information (processed by our payment provider; we do not store raw card data)</li>
              <li>Communications you send to us (support tickets, feedback)</li>
            </ul>
            <p><strong className="text-white">Information collected automatically:</strong></p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Log data (IP address, browser type, pages visited, timestamps)</li>
              <li>Device information (operating system, screen resolution)</li>
              <li>Usage data (features used, campaign counts, session duration)</li>
              <li>Cookies and similar tracking technologies (see Section 7)</li>
            </ul>
            <p><strong className="text-white">Information from third parties:</strong></p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>OAuth authentication providers (e.g., Google) — we receive your name, email, and profile photo</li>
              <li>Affiliate network APIs you authorize FinesseOS to connect to</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Provide, operate, and improve the Service</li>
              <li>Process affiliate links and generate AI-powered campaign assets</li>
              <li>Authenticate your identity and maintain your session</li>
              <li>Process payments and send billing-related communications</li>
              <li>Send transactional emails (account confirmations, password resets)</li>
              <li>Send product updates and marketing communications (you may opt out at any time)</li>
              <li>Detect, investigate, and prevent fraudulent or abusive activity</li>
              <li>Comply with legal obligations</li>
              <li>Train and improve our AI models using anonymized, aggregated data only</li>
            </ul>
            <p>
              We do not sell your personal information to third parties. We do not use your submitted affiliate links or generated content to train public AI models without your explicit consent.
            </p>
          </Section>

          <Section title="4. How We Share Your Information">
            <p>We may share your information with:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong className="text-white">Service providers:</strong> Cloud hosting, payment processors, email delivery, and analytics vendors who process data on our behalf under strict data processing agreements</li>
              <li><strong className="text-white">AI infrastructure partners:</strong> LLM API providers receive your input prompts to generate campaign content; they are contractually prohibited from using your data for model training</li>
              <li><strong className="text-white">Legal requirements:</strong> When required by law, court order, or governmental authority</li>
              <li><strong className="text-white">Business transfers:</strong> In connection with a merger, acquisition, or sale of assets, with notice provided to you</li>
            </ul>
          </Section>

          <Section title="5. Data Retention">
            <p>
              We retain your account data for as long as your account is active or as needed to provide the Service. Campaign data and generated assets are retained for 12 months after your last active session, after which they are deleted from our systems.
            </p>
            <p>
              You may request deletion of your account and associated data at any time by contacting us at <span className="font-mono text-blue-400">privacy@finesseos.pro</span>. We will process deletion requests within 30 days, subject to legal retention obligations.
            </p>
          </Section>

          <Section title="6. Data Security">
            <p>
              We implement industry-standard security measures including TLS encryption in transit, AES-256 encryption at rest, access controls, and regular security audits. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
            <p>
              In the event of a data breach that affects your personal information, we will notify you as required by applicable law.
            </p>
          </Section>

          <Section title="7. Cookies and Tracking">
            <p>
              We use cookies and similar technologies for authentication (session cookies), preference storage, and analytics. Specifically:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong className="text-white">Essential cookies:</strong> Required for authentication and core functionality; cannot be disabled</li>
              <li><strong className="text-white">Analytics cookies:</strong> Used to understand how users interact with the Service (e.g., page views, feature usage); you may opt out via your browser settings</li>
              <li><strong className="text-white">Marketing cookies:</strong> We do not use third-party advertising cookies on the Service</li>
            </ul>
          </Section>

          <Section title="8. Your Rights">
            <p>Depending on your jurisdiction, you may have the following rights regarding your personal data:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong className="text-white">Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong className="text-white">Correction:</strong> Request correction of inaccurate or incomplete data</li>
              <li><strong className="text-white">Deletion:</strong> Request deletion of your personal data ("right to be forgotten")</li>
              <li><strong className="text-white">Portability:</strong> Request your data in a machine-readable format</li>
              <li><strong className="text-white">Objection:</strong> Object to processing of your data for marketing purposes</li>
              <li><strong className="text-white">Restriction:</strong> Request that we restrict processing of your data in certain circumstances</li>
            </ul>
            <p>
              To exercise any of these rights, contact us at <span className="font-mono text-blue-400">privacy@finesseos.pro</span>. We will respond within 30 days.
            </p>
          </Section>

          <Section title="9. Children's Privacy">
            <p>
              The Service is not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal information, we will delete it promptly.
            </p>
          </Section>

          <Section title="10. International Data Transfers">
            <p>
              FinesseOS is operated from the United States. If you access the Service from outside the United States, your information may be transferred to, stored, and processed in the United States. By using the Service, you consent to this transfer.
            </p>
            <p>
              For users in the European Economic Area (EEA), we rely on Standard Contractual Clauses (SCCs) as the legal mechanism for international data transfers.
            </p>
          </Section>

          <Section title="11. California Privacy Rights (CCPA)">
            <p>
              California residents have additional rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information we collect, the right to delete personal information, and the right to opt out of the sale of personal information. We do not sell personal information.
            </p>
            <p>
              To exercise your CCPA rights, contact us at <span className="font-mono text-blue-400">privacy@finesseos.pro</span> or use the "Delete My Account" option in your account settings.
            </p>
          </Section>

          <Section title="12. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes by posting the new policy on this page and updating the "Last updated" date. For significant changes, we will also send an email notification to registered users.
            </p>
          </Section>

          <Section title="13. Contact Us">
            <p>
              If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact our Privacy Team at:
            </p>
            <p className="font-mono text-blue-400">privacy@finesseos.pro</p>
            <p className="text-zinc-400">FinesseOS LLC · United States</p>
          </Section>

        </div>

        {/* ── Footer links ── */}
        <div className="mt-10 flex items-center gap-6 text-xs text-zinc-500 font-mono">
          <Link href="/terms" className="hover:text-zinc-300 transition-colors">Terms &amp; Conditions</Link>
          <span>·</span>
          <Link href="/" className="hover:text-zinc-300 transition-colors">← Back to FinesseOS</Link>
        </div>
      </main>
    </div>
  );
}
