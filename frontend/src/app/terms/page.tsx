import React from 'react';

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-4xl prose prose-invert">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      <p className="text-gray-400 mb-4">Last Updated: March 15, 2026</p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white">1. Acceptance of Terms</h2>
        <p>
          By accessing or using LYNCE, you agree to be bound by these Terms of Service. If you do not agree to all of the terms and conditions, you may not use our services.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white">2. Use of Services</h2>
        <p>
          You must use LYNCE only for lawful purposes. You are strictly prohibited from:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Using the scanner on websites you do not own or have explicit authorization to test.</li>
          <li>Attempting to bypass our rate limits or security measures.</li>
          <li>Using the data provided for malicious purposes or illegal activities.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white">3. Accounts</h2>
        <p>
          You are responsible for maintaining the confidentiality of your account credentials. You must notify us immediately of any unauthorized use of your account.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white">4. Subscription and Payments</h2>
        <p>
          Certain features require a paid subscription. All payments are non-refundable unless required by law. We reserve the right to change our pricing upon 30 days notice.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white">5. Limitation of Liability</h2>
        <p>
          LYNCE provides security scanning based on publicly available data. We do not guarantee that our scan will identify every potential vulnerability. LYNCE shall not be liable for any damages resulting from the use or inability to use the service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white">6. Termination</h2>
        <p>
          We reserve the right to suspend or terminate your account at our sole discretion, without notice, for conduct that we believe violates these Terms of Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white">7. Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of the United Kingdom, without regard to its conflict of law provisions.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white">8. Changes to Terms</h2>
        <p>
          We reserve the right to modify these terms at any time. We will provide notice of any significant changes by posting the new Terms of Service on this site.
        </p>
      </section>
    </div>
  );
}
