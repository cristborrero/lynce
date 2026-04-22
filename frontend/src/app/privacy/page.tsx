import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-4xl prose prose-invert">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <p className="text-gray-400 mb-4">Last Updated: March 15, 2026</p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white">1. Introduction</h2>
        <p>
          Welcome to LYNCE ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website lynce.io and use our security scanning services.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white">2. Information We Collect</h2>
        <h3 className="text-xl font-medium mb-2 text-white">Personal Data</h3>
        <p>
          We collect personal information that you voluntarily provide to us when you register for an account, subscribe to our newsletter, or contact us. This includes:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Name and Email Address</li>
          <li>Billing information (processed via Stripe)</li>
          <li>Login credentials (via Supabase)</li>
        </ul>

        <h3 className="text-xl font-medium mb-2 text-white">Technical Data</h3>
        <p>
          When you use our security scanner, we collect technical data about the target website, including:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Website URL</li>
          <li>Server response headers</li>
          <li>SSL certificate details</li>
          <li>Publicly accessible files and directory structures</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white">3. How We Use Your Information</h2>
        <p>
          We use your information to:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Provide and maintain our security scanning services.</li>
          <li>Process your subscription and payments.</li>
          <li>Send security alerts and administrative information.</li>
          <li>Improve our scanning algorithms and user experience.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white">4. Data Retention Policy</h2>
        <p>
          We retain your personal information for as long as your account is active. Regarding scan results:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li><strong>Free Tier:</strong> Scan results are stored for 90 days.</li>
          <li><strong>Pro & Agency Tiers:</strong> Scan results are stored for 1 year.</li>
        </ul>
        <p>
          After these periods, scan data is automatically deleted from our production databases. You may request manual deletion of your data at any time.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white">5. GDPR Compliance (UK/EU Residents)</h2>
        <p>
          Under the General Data Protection Regulation (GDPR), you have the following rights:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li><strong>Access:</strong> The right to request copies of your personal data.</li>
          <li><strong>Rectification:</strong> The right to request that we correct any information you believe is inaccurate.</li>
          <li><strong>Erasure:</strong> The right to request that we erase your personal data under certain conditions.</li>
          <li><strong>Data Portability:</strong> The right to request that we transfer the data we have collected to another organization.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white">6. Cookies</h2>
        <p>
          We use essential cookies for authentication and performance. You can manage your cookie preferences through our consent banner.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white">7. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at:
          <br />
          <strong>Email:</strong> privacy@lynce.io
          <br />
          <strong>Location:</strong> Surrey, United Kingdom
        </p>
      </section>
    </div>
  );
}
