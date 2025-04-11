'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Header from '@/components/Header';
import ArticleList from '@/components/ArticleList';
import Link from 'next/link';

interface TagPageProps {
  params: {
    id: string;
  };
}

interface Tag {
  id: number;
  name: string;
}

export default function TagPage({ params }: TagPageProps) {
  const [tag, setTag] = useState<Tag | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // In Next.js 15, we need to use React.use() to unwrap params
  const unwrappedParams = use(params);
  const tagId = parseInt(unwrappedParams.id);

  useEffect(() => {
    const fetchTag = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/tags/${tagId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch tag');
        }

        setTag(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    if (tagId) {
      fetchTag();
    }
  }, [tagId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">Loading tag...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
          <div className="mt-4">
            <Link href="/tags" className="text-indigo-600 hover:text-indigo-800">
              &larr; Back to tags
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!tag) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">Tag not found</div>
          <div className="mt-4 text-center">
            <Link href="/tags" className="text-indigo-600 hover:text-indigo-800">
              &larr; Back to tags
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/tags" className="text-indigo-600 hover:text-indigo-800">
            &larr; Back to tags
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Articles tagged with "{tag.name}"
          </h1>
        </div>

        <ArticleList tagId={tagId} />
      </main>
    </div>
  );
}