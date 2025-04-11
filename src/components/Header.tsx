'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-gray-900">
          AI-Augmented RSS Reader
        </Link>
        <nav className="flex space-x-4">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            Home
          </Link>
          <Link href="/feeds" className="text-gray-600 hover:text-gray-900">
            Feeds
          </Link>
          <Link href="/tags" className="text-gray-600 hover:text-gray-900">
            Tags
          </Link>
          <Link href="/search" className="text-gray-600 hover:text-gray-900">
            Search
          </Link>
        </nav>
      </div>
    </header>
  );
}