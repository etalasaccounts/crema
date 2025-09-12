import { NavbarTop } from "../navbar";
import Link from "next/link";
import { Suspense } from "react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={<div className="h-16 bg-white" />}>
        <NavbarTop />
      </Suspense>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Privacy Policy
          </h1>
          <p className="text-gray-600 mb-8">Last updated: January 15, 2025</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to Screenbolt ("we," "our," or "us"). We are committed
                to protecting your privacy and ensuring the security of your
                personal information. This Privacy Policy explains how we
                collect, use, disclose, and safeguard your information when you
                use our video recording and sharing platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Information We Collect
              </h2>

              <h3 className="text-xl font-medium text-gray-800 mb-3">
                2.1 Personal Information
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Email address and name when you create an account</li>
                <li>Profile information you choose to provide</li>
                <li>Payment information for subscription services</li>
                <li>Communication preferences and settings</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">
                2.2 Video Content
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Screen recordings and video content you create</li>
                <li>Audio recordings included in your videos</li>
                <li>
                  Metadata associated with your recordings (timestamps,
                  duration, etc.)
                </li>
                <li>Comments and annotations you add to videos</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">
                2.3 Technical Information
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Operating system and screen resolution</li>
                <li>Usage patterns and feature interactions</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. How We Use Your Information
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  Provide and maintain our video recording and sharing services
                </li>
                <li>
                  Process your recordings and enable sharing functionality
                </li>
                <li>
                  Authenticate your account and prevent unauthorized access
                </li>
                <li>
                  Send important service updates and security notifications
                </li>
                <li>Improve our platform based on usage analytics</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Process payments and manage subscriptions</li>
                <li>Comply with legal obligations and enforce our terms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Information Sharing and Disclosure
              </h2>

              <h3 className="text-xl font-medium text-gray-800 mb-3">
                4.1 Video Sharing
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Your video content is shared only according to the privacy
                settings you choose. You control whether videos are private,
                shared with specific people, or made publicly accessible.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">
                4.2 Service Providers
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may share information with trusted third-party service
                providers who assist us in operating our platform, including
                cloud storage providers, payment processors, and analytics
                services. These providers are bound by confidentiality
                agreements.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">
                4.3 Legal Requirements
              </h3>
              <p className="text-gray-700 leading-relaxed">
                We may disclose information when required by law, to protect our
                rights, or to ensure the safety of our users and the public.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Data Storage and Security
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  We use industry-standard encryption to protect your data in
                  transit and at rest
                </li>
                <li>
                  Video content is stored securely in encrypted cloud storage
                </li>
                <li>
                  Access to your data is restricted to authorized personnel only
                </li>
                <li>
                  We regularly audit our security practices and update our
                  systems
                </li>
                <li>
                  We implement multi-factor authentication and access controls
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Your Rights and Choices
              </h2>

              <h3 className="text-xl font-medium text-gray-800 mb-3">
                6.1 Account Management
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Access and update your personal information</li>
                <li>Delete your videos and account data</li>
                <li>Export your video content</li>
                <li>Modify privacy settings for your recordings</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">
                6.2 Communication Preferences
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Opt out of marketing communications</li>
                <li>Choose notification preferences</li>
                <li>Control cookie settings in your browser</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Data Retention
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your personal information and video content for as
                long as your account is active or as needed to provide services.
                When you delete your account, we will delete your personal
                information and video content within 30 days, except where we
                are required to retain certain information for legal or
                regulatory purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. International Data Transfers
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Your information may be transferred to and processed in
                countries other than your own. We ensure that such transfers
                comply with applicable data protection laws and implement
                appropriate safeguards to protect your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                9. Children's Privacy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Our service is not intended for children under 13 years of age.
                We do not knowingly collect personal information from children
                under 13. If you are a parent or guardian and believe your child
                has provided us with personal information, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                10. Changes to This Privacy Policy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will
                notify you of any material changes by posting the new Privacy
                Policy on this page and updating the "Last updated" date. We
                encourage you to review this Privacy Policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                11. Contact Us
              </h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about this Privacy Policy or our
                privacy practices, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> h@etalas.com
                </p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back to Home
              </Link>
              <Link
                href="/terms"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View Terms of Service →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
