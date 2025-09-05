'use client';

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-8 text-center border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} TJournal. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <Link href="/privacy" className="hover:text-blue-400 transition">Privacy</Link>
            <Link href="/terms" className="hover:text-blue-400 transition">Terms</Link>
            <Link href="/contact" className="hover:text-blue-400 transition">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
