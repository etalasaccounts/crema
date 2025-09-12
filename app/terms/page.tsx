import { NavbarTop } from "../navbar";
import Link from "next/link";
import { Suspense } from "react";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={<div className="h-16 bg-white" />}>
        <NavbarTop />
      </Suspense>
      <div className="max-w-4xl mx-auto px-4 pb-16 pt-36">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Terms of Service
          </h1>
          <p className="text-gray-600 mb-8">Last updated: January 15, 2025</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing or using Screenbolt ("the Service"), you agree to
                be bound by these Terms of Service ("Terms"). If you disagree
                with any part of these terms, then you may not access the
                Service. These Terms apply to all visitors, users, and others
                who access or use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Description of Service
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Screenbolt is a video recording and sharing platform that allows
                users to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Record screen activities and create video content</li>
                <li>Share videos with others through secure links</li>
                <li>Collaborate through video messaging and comments</li>
                <li>Store and organize video content in the cloud</li>
                <li>Access analytics and viewer insights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. User Accounts
              </h2>

              <h3 className="text-xl font-medium text-gray-800 mb-3">
                3.1 Account Creation
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  You must provide accurate and complete information when
                  creating an account
                </li>
                <li>
                  You are responsible for maintaining the security of your
                  account credentials
                </li>
                <li>You must be at least 13 years old to create an account</li>
                <li>
                  One person or legal entity may maintain no more than one free
                  account
                </li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">
                3.2 Account Responsibilities
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  You are responsible for all activities that occur under your
                  account
                </li>
                <li>
                  You must notify us immediately of any unauthorized use of your
                  account
                </li>
                <li>You may not share your account credentials with others</li>
                <li>
                  You may not use another user's account without permission
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Acceptable Use Policy
              </h2>

              <h3 className="text-xl font-medium text-gray-800 mb-3">
                4.1 Permitted Uses
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may use Screenbolt for legitimate business, educational, and
                personal purposes, including creating tutorials, presentations,
                demonstrations, and collaborative content.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">
                4.2 Prohibited Uses
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may not use the Service to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  Upload, share, or distribute illegal, harmful, or offensive
                  content
                </li>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon intellectual property rights of others</li>
                <li>Record or share content without proper authorization</li>
                <li>Distribute malware, viruses, or other harmful code</li>
                <li>Engage in harassment, bullying, or threatening behavior</li>
                <li>Spam or send unsolicited communications</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the Service</li>
                <li>
                  Use the Service for competitive intelligence or benchmarking
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Content and Intellectual Property
              </h2>

              <h3 className="text-xl font-medium text-gray-800 mb-3">
                5.1 Your Content
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  You retain ownership of all content you create and upload
                </li>
                <li>
                  You grant us a limited license to store, process, and display
                  your content
                </li>
                <li>
                  You are responsible for ensuring you have rights to all
                  content you upload
                </li>
                <li>You may delete your content at any time</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">
                5.2 Our Intellectual Property
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  Screenbolt and its features are protected by intellectual
                  property laws
                </li>
                <li>
                  You may not copy, modify, or distribute our software or
                  content
                </li>
                <li>
                  Our trademarks and logos may not be used without permission
                </li>
                <li>We reserve all rights not expressly granted to you</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">
                5.3 Copyright Policy
              </h3>
              <p className="text-gray-700 leading-relaxed">
                We respect intellectual property rights and will respond to
                valid copyright infringement notices. If you believe your
                copyright has been infringed, please contact us with detailed
                information about the alleged infringement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Privacy and Data Protection
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Your privacy is important to us. Our collection and use of
                personal information is governed by our Privacy Policy, which is
                incorporated into these Terms by reference. By using the
                Service, you consent to the collection and use of information as
                described in our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Subscription and Payment Terms
              </h2>

              <h3 className="text-xl font-medium text-gray-800 mb-3">
                7.1 Subscription Plans
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>We offer both free and paid subscription plans</li>
                <li>
                  Paid plans provide additional features and storage capacity
                </li>
                <li>
                  Subscription fees are billed in advance on a recurring basis
                </li>
                <li>All fees are non-refundable except as required by law</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">
                7.2 Payment Processing
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Payments are processed by third-party payment providers</li>
                <li>
                  You authorize us to charge your payment method for applicable
                  fees
                </li>
                <li>
                  You must keep your payment information current and accurate
                </li>
                <li>We may suspend service for failed payments</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">
                7.3 Cancellation and Refunds
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>You may cancel your subscription at any time</li>
                <li>
                  Cancellation takes effect at the end of your current billing
                  period
                </li>
                <li>No refunds are provided for partial months of service</li>
                <li>
                  We may offer refunds at our discretion for exceptional
                  circumstances
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. Service Availability and Modifications
              </h2>

              <h3 className="text-xl font-medium text-gray-800 mb-3">
                8.1 Service Availability
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  We strive to maintain high service availability but cannot
                  guarantee 100% uptime
                </li>
                <li>Scheduled maintenance may temporarily interrupt service</li>
                <li>
                  We are not liable for service interruptions beyond our control
                </li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">
                8.2 Service Modifications
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  We may modify, update, or discontinue features at any time
                </li>
                <li>We will provide reasonable notice of material changes</li>
                <li>
                  Continued use of the Service constitutes acceptance of
                  modifications
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                9. Termination
              </h2>

              <h3 className="text-xl font-medium text-gray-800 mb-3">
                9.1 Termination by You
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may terminate your account at any time by contacting us or
                using the account deletion feature. Upon termination, your
                access to the Service will cease immediately.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">
                9.2 Termination by Us
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may terminate or suspend your account immediately if you
                violate these Terms, engage in prohibited activities, or for any
                other reason at our sole discretion.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">
                9.3 Effect of Termination
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Your right to use the Service will cease immediately</li>
                <li>
                  We may delete your account and content after termination
                </li>
                <li>
                  Provisions that should survive termination will remain in
                  effect
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                10. Disclaimers and Limitation of Liability
              </h2>

              <h3 className="text-xl font-medium text-gray-800 mb-3">
                10.1 Service Disclaimers
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
                WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR
                IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR
                PURPOSE, AND NON-INFRINGEMENT.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">
                10.2 Limitation of Liability
              </h3>
              <p className="text-gray-700 leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE
                FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
                PUNITIVE DAMAGES, INCLUDING LOST PROFITS, DATA LOSS, OR BUSINESS
                INTERRUPTION.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                11. Indemnification
              </h2>
              <p className="text-gray-700 leading-relaxed">
                You agree to indemnify and hold us harmless from any claims,
                damages, losses, or expenses arising from your use of the
                Service, violation of these Terms, or infringement of any rights
                of another party.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                12. Governing Law and Dispute Resolution
              </h2>

              <h3 className="text-xl font-medium text-gray-800 mb-3">
                12.1 Governing Law
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                These Terms are governed by the laws of the State of California,
                United States, without regard to conflict of law principles.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">
                12.2 Dispute Resolution
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Any disputes arising from these Terms or your use of the Service
                will be resolved through binding arbitration in accordance with
                the rules of the American Arbitration Association.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                13. Changes to Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will
                notify users of material changes by posting the updated Terms on
                our website and updating the "Last updated" date. Your continued
                use of the Service after changes become effective constitutes
                acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                14. Severability
              </h2>
              <p className="text-gray-700 leading-relaxed">
                If any provision of these Terms is found to be unenforceable or
                invalid, the remaining provisions will continue in full force
                and effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                15. Contact Information
              </h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these Terms of Service, please
                contact us at:
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
                href="/privacy"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View Privacy Policy →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
