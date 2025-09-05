'use client';

import { ArrowLeft, Shield, Lock, Eye, Database, Users, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900/90 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Privacy Policy</h1>
                <p className="text-sm text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose prose-lg max-w-none">
          
          {/* Introduction */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Shield className="w-6 h-6 text-green-400" />
              Introduction
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              At TJournal, we are committed to protecting your privacy and ensuring the security of your trading data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our trading journal platform.
            </p>
            <div className="bg-green-500/10 rounded-xl p-6 border border-green-500/20">
              <p className="text-green-300">
                <strong>Our Commitment:</strong> Your trading data is encrypted, secure, and never shared with third parties for marketing purposes.
              </p>
            </div>
          </div>

          {/* Information We Collect */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Database className="w-6 h-6 text-blue-400" />
              Information We Collect
            </h2>
            
            <div className="space-y-6">
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Account Information
                </h3>
                <ul className="text-gray-300 space-y-2">
                  <li>• Email address (for account creation and communication)</li>
                  <li>• Password (encrypted and securely stored)</li>
                  <li>• Display name or username</li>
                  <li>• Account preferences and settings</li>
                </ul>
              </div>

              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-purple-400" />
                  Trading Data
                </h3>
                <ul className="text-gray-300 space-y-2">
                  <li>• Trade entries, exits, and positions</li>
                  <li>• Profit and loss information</li>
                  <li>• Trading strategies and notes</li>
                  <li>• Chart screenshots and annotations</li>
                  <li>• Performance metrics and analytics</li>
                </ul>
              </div>

              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Database className="w-5 h-5 text-cyan-400" />
                  Technical Information
                </h3>
                <ul className="text-gray-300 space-y-2">
                  <li>• Device information and browser type</li>
                  <li>• IP address (for security purposes)</li>
                  <li>• Usage patterns and feature interactions</li>
                  <li>• Error logs and performance data</li>
                </ul>
              </div>
            </div>
          </div>

          {/* How We Use Your Information */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
              How We Use Your Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-3">Service Provision</h3>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li>• Provide and maintain the trading journal platform</li>
                  <li>• Process and store your trading data</li>
                  <li>• Generate performance analytics and reports</li>
                  <li>• Enable data synchronization across devices</li>
                </ul>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-3">Communication</h3>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li>• Send important service updates</li>
                  <li>• Provide customer support</li>
                  <li>• Notify about security issues</li>
                  <li>• Share platform improvements</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Data Security */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Lock className="w-6 h-6 text-red-400" />
              Data Security
            </h2>
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <p className="text-gray-300 leading-relaxed mb-4">
                We implement industry-standard security measures to protect your data:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Encryption</h3>
                  <ul className="text-gray-300 space-y-2 text-sm">
                    <li>• 256-bit SSL/TLS encryption in transit</li>
                    <li>• AES-256 encryption at rest</li>
                    <li>• End-to-end encryption for sensitive data</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Access Control</h3>
                  <ul className="text-gray-300 space-y-2 text-sm">
                    <li>• Multi-factor authentication</li>
                    <li>• Role-based access controls</li>
                    <li>• Regular security audits</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Data Sharing */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-400" />
              Data Sharing and Disclosure
            </h2>
            <div className="bg-yellow-500/10 rounded-xl p-6 border border-yellow-500/20 mb-6">
              <p className="text-yellow-300">
                <strong>We do NOT sell, trade, or rent your personal trading data to third parties.</strong>
              </p>
            </div>
            <p className="text-gray-300 leading-relaxed mb-4">
              We may share your information only in the following limited circumstances:
            </p>
            <ul className="text-gray-300 space-y-2 ml-6">
              <li>• With your explicit consent</li>
              <li>• To comply with legal obligations or court orders</li>
              <li>• To protect our rights, property, or safety</li>
              <li>• With trusted service providers who assist in platform operations (under strict confidentiality agreements)</li>
            </ul>
          </div>

          {/* Your Rights */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Your Rights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-3">Data Access</h3>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li>• View and download your trading data</li>
                  <li>• Access your account information</li>
                  <li>• Request data portability</li>
                </ul>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-3">Data Control</h3>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li>• Update or correct your information</li>
                  <li>• Delete your account and data</li>
                  <li>• Opt-out of communications</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Data Retention */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Data Retention</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We retain your data for as long as your account is active or as needed to provide services. You can request deletion of your data at any time, and we will process such requests within 30 days.
            </p>
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-3">Retention Periods</h3>
              <ul className="text-gray-300 space-y-2">
                <li>• Account data: Until account deletion</li>
                <li>• Trading data: Until account deletion or 7 years (for tax purposes)</li>
                <li>• Logs and analytics: 12 months maximum</li>
                <li>• Backup data: 30 days after deletion request</li>
              </ul>
            </div>
          </div>

          {/* Cookies and Tracking */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Cookies and Tracking</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We use essential cookies to maintain your session and improve platform functionality. We do not use tracking cookies for advertising purposes.
            </p>
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-3">Cookie Types</h3>
              <ul className="text-gray-300 space-y-2">
                <li>• Session cookies: Essential for platform functionality</li>
                <li>• Preference cookies: Remember your settings</li>
                <li>• Security cookies: Protect against unauthorized access</li>
              </ul>
            </div>
          </div>

          {/* International Transfers */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">International Data Transfers</h2>
            <p className="text-gray-300 leading-relaxed">
              Your data may be processed and stored in secure data centers located in different countries. We ensure that all international transfers comply with applicable data protection laws and maintain the same level of security and protection.
            </p>
          </div>

          {/* Changes to Privacy Policy */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Changes to This Privacy Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes via email or through the platform. Your continued use of the service after changes constitutes acceptance of the updated policy.
            </p>
          </div>

          {/* Contact Information */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <p className="text-gray-300 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="space-y-2 text-gray-300">
                <p>• Email: privacy@tjournal.com</p>
                <p>• Data Protection Officer: dpo@tjournal.com</p>
                <p>• Platform: Through the in-app support system</p>
                <p>• Response time: Within 24-48 hours</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-8 border-t border-gray-800">
            <p className="text-gray-400 text-sm">
              This Privacy Policy is effective as of {new Date().toLocaleDateString()} and will remain in effect except with respect to any changes in its provisions in the future.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
