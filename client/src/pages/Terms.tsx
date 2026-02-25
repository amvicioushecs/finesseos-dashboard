// FinesseOS — Terms & Conditions
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

export default function Terms() {
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
            Terms &amp; Conditions
          </h1>
          <p className="text-zinc-400 text-sm font-mono">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 sm:p-12">

          <Section title="1. Acceptance of Terms">
            <p>
              By accessing or using FinesseOS (the "Service"), operated by FinesseOS LLC ("we," "us," or "our"), you agree to be bound by these Terms &amp; Conditions ("Terms"). If you do not agree to all of these Terms, do not access or use the Service.
            </p>
            <p>
              We reserve the right to modify these Terms at any time. Continued use of the Service after changes are posted constitutes your acceptance of the revised Terms. We will notify registered users of material changes via email or in-app notification.
            </p>
          </Section>

          <Section title="2. Description of Service">
            <p>
              FinesseOS is an AI-powered affiliate marketing intelligence platform that automates campaign creation, keyword research, buyer persona generation, content production, and performance analytics from a single affiliate link input.
            </p>
            <p>
              The Service is intended for affiliate marketers, content creators, and digital marketing professionals. You must be at least 18 years of age to use the Service.
            </p>
          </Section>

          <Section title="3. Account Registration">
            <p>
              To access the full features of FinesseOS, you must create an account. You agree to provide accurate, current, and complete information during registration and to keep your account credentials secure. You are responsible for all activity that occurs under your account.
            </p>
            <p>
              We reserve the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activity, or abuse the platform's AI generation systems.
            </p>
          </Section>

          <Section title="4. Subscription Plans and Billing">
            <p>
              FinesseOS offers free and paid subscription tiers. Paid plans are billed on a monthly or annual basis as selected at checkout. All fees are non-refundable except as required by applicable law or as explicitly stated in our refund policy.
            </p>
            <p>
              We reserve the right to modify pricing with 30 days' notice to existing subscribers. Continued use of a paid plan after a price change takes effect constitutes acceptance of the new pricing.
            </p>
            <p>
              You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period; you will retain access to paid features until that date.
            </p>
          </Section>

          <Section title="5. Acceptable Use">
            <p>You agree not to use the Service to:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Generate spam, deceptive content, or misleading advertising materials</li>
              <li>Promote illegal products, services, or activities</li>
              <li>Violate the terms of any affiliate network or advertising platform</li>
              <li>Scrape, reverse-engineer, or attempt to extract the underlying AI models</li>
              <li>Resell or sublicense access to the Service without our written consent</li>
              <li>Circumvent usage limits or access controls</li>
            </ul>
            <p>
              Violation of this section may result in immediate account termination without refund.
            </p>
          </Section>

          <Section title="6. Intellectual Property">
            <p>
              All content, software, and technology underlying the FinesseOS platform — including but not limited to the AI models, UI design, and automation workflows — is the exclusive property of FinesseOS LLC and is protected by applicable intellectual property laws.
            </p>
            <p>
              Content generated by the Service on your behalf (campaign copy, keyword lists, personas, etc.) is owned by you, subject to your compliance with these Terms. You grant FinesseOS a limited, non-exclusive license to use anonymized, aggregated outputs to improve the Service.
            </p>
          </Section>

          <Section title="7. Third-Party Services and Affiliate Networks">
            <p>
              FinesseOS integrates with or links to third-party affiliate networks, advertising platforms, and analytics services. We are not responsible for the terms, policies, or practices of these third parties. Your use of third-party services is governed by their respective terms.
            </p>
            <p>
              We do not guarantee that content generated by FinesseOS will comply with the policies of any specific affiliate network. You are solely responsible for reviewing generated content before publishing or submitting it to any network.
            </p>
          </Section>

          <Section title="8. Disclaimer of Warranties">
            <p>
              The Service is provided "as is" and "as available" without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.
            </p>
            <p>
              We do not warrant that the Service will be uninterrupted, error-free, or that AI-generated content will be accurate, complete, or suitable for any particular purpose. Affiliate marketing results vary and are not guaranteed.
            </p>
          </Section>

          <Section title="9. Limitation of Liability">
            <p>
              To the maximum extent permitted by applicable law, FinesseOS LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or goodwill, arising from your use of or inability to use the Service.
            </p>
            <p>
              Our total cumulative liability to you for any claims arising under these Terms shall not exceed the greater of (a) the amount you paid to us in the 12 months preceding the claim, or (b) $100 USD.
            </p>
          </Section>

          <Section title="10. Indemnification">
            <p>
              You agree to indemnify, defend, and hold harmless FinesseOS LLC, its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable attorneys' fees) arising out of or in any way connected with your use of the Service, your violation of these Terms, or your violation of any third-party rights.
            </p>
          </Section>

          <Section title="11. Governing Law and Dispute Resolution">
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions.
            </p>
            <p>
              Any dispute arising from these Terms or your use of the Service shall be resolved through binding arbitration under the rules of the American Arbitration Association, except that either party may seek injunctive relief in a court of competent jurisdiction for intellectual property violations.
            </p>
          </Section>

          <Section title="12. Contact">
            <p>
              If you have questions about these Terms, please contact us at:
            </p>
            <p className="font-mono text-blue-400">legal@finesseos.pro</p>
          </Section>

        </div>

        {/* ── Footer links ── */}
        <div className="mt-10 flex items-center gap-6 text-xs text-zinc-500 font-mono">
          <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy Policy</Link>
          <span>·</span>
          <Link href="/" className="hover:text-zinc-300 transition-colors">← Back to FinesseOS</Link>
        </div>
      </main>
    </div>
  );
}
