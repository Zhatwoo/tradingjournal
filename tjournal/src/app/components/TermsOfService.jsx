'use client';

import { ArrowLeft, FileText, Shield, Users, CreditCard, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function TermsOfService() {
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
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Terms of Service</h1>
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
              <Shield className="w-6 h-6 text-blue-400" />
              Introduction
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Welcome to TJournal, a professional trading journal platform designed to help traders track, analyze, and improve their trading performance. These Terms of Service ("Terms") govern your use of our platform and services.
            </p>
            <p className="text-gray-300 leading-relaxed">
              By accessing or using TJournal, you agree to be bound by these Terms. If you disagree with any part of these terms, you may not access the service.
            </p>
          </div>

          {/* Acceptance of Terms */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Users className="w-6 h-6 text-green-400" />
              Acceptance of Terms
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              By creating an account or using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.
            </p>
            <ul className="text-gray-300 space-y-2 ml-6">
              <li>• You must be at least 18 years old to use our services</li>
              <li>• You are responsible for maintaining the confidentiality of your account</li>
              <li>• You agree to provide accurate and complete information</li>
              <li>• You will not use the service for any unlawful purpose</li>
            </ul>
          </div>

          {/* Service Description */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <FileText className="w-6 h-6 text-purple-400" />
              Service Description
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              TJournal provides a comprehensive trading journal platform that includes:
            </p>
            <ul className="text-gray-300 space-y-2 ml-6">
              <li>• Trade logging and tracking capabilities</li>
              <li>• Performance analytics and reporting</li>
              <li>• Visual documentation tools</li>
              <li>• Data visualization and charts</li>
              <li>• Cloud-based data storage and synchronization</li>
            </ul>
          </div>

          {/* User Responsibilities */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
              User Responsibilities
            </h2>
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-3">You agree to:</h3>
              <ul className="text-gray-300 space-y-2">
                <li>• Use the service only for lawful purposes</li>
                <li>• Not attempt to gain unauthorized access to our systems</li>
                <li>• Not share your account credentials with others</li>
                <li>• Provide accurate trading data and information</li>
                <li>• Respect the intellectual property rights of others</li>
                <li>• Not use the service to violate any applicable laws or regulations</li>
              </ul>
            </div>
          </div>

          {/* Data and Privacy */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Shield className="w-6 h-6 text-blue-400" />
              Data and Privacy
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We take your privacy seriously. Your trading data is encrypted and stored securely. We do not sell or share your personal trading information with third parties.
            </p>
            <p className="text-gray-300 leading-relaxed">
              For detailed information about how we collect, use, and protect your data, please review our <Link href="/privacy" className="text-blue-400 hover:text-blue-300 underline">Privacy Policy</Link>.
            </p>
          </div>

          {/* Service Availability */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Service Availability</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We strive to maintain high service availability, but we cannot guarantee uninterrupted access. We may perform maintenance, updates, or modifications that temporarily affect service availability.
            </p>
            <div className="bg-blue-500/10 rounded-xl p-6 border border-blue-500/20">
              <p className="text-blue-300">
                <strong>Note:</strong> TJournal is currently provided as a free service. We reserve the right to introduce premium features or modify our service model in the future with appropriate notice.
              </p>
            </div>
          </div>

          {/* Limitation of Liability */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Limitation of Liability</h2>
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <p className="text-gray-300 leading-relaxed mb-4">
                TJournal is provided "as is" without warranties of any kind. We are not responsible for:
              </p>
              <ul className="text-gray-300 space-y-2 ml-6">
                <li>• Trading losses or financial decisions made based on our platform</li>
                <li>• Data loss or corruption</li>
                <li>• Service interruptions or downtime</li>
                <li>• Third-party integrations or external services</li>
              </ul>
            </div>
          </div>

          {/* Changes to Terms */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Changes to Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or through the platform. Continued use of the service after changes constitutes acceptance of the new Terms.
            </p>
          </div>

          {/* Contact Information */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Contact Information</h2>
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <p className="text-gray-300 leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2 text-gray-300">
                <p>• Email: support@tjournal.com</p>
                <p>• Platform: Through the in-app support system</p>
                <p>• Response time: Within 24-48 hours</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-8 border-t border-gray-800">
            <p className="text-gray-400 text-sm">
              These Terms of Service are effective as of {new Date().toLocaleDateString()} and will remain in effect except with respect to any changes in their provisions in the future.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
