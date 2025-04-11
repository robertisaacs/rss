'use client';

import Header from '@/components/Header';
import SemanticSearch from '@/components/SemanticSearch';

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Semantic Search</h1>
        <p className="text-gray-600 mb-6">
          Search for articles by meaning, not just keywords. Our AI-powered semantic search understands the context and concepts in your query.
        </p>
        
        <SemanticSearch />
      </main>
    </div>
  );
}