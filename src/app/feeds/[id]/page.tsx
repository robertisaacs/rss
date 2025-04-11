'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Header from '@/components/Header';
import ArticleList from '@/components/ArticleList';
import Link from 'next/link';

interface FeedPageProps {
  params: {
    id: string;
  };
}

interface Feed {
  id: number;
  title: string;
  url: string;
  lastFetchedAt: string | null;
}

export default function FeedPage({ params }: FeedPageProps) {
  const [feed, setFeed] = useState<Feed | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // In Next.js 15, we need to use React.use() to unwrap params
  const unwrappedParams = use(params);
  const feedId = parseInt(unwrappedParams.id);

  const fetchFeed = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/feeds/${feedId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch feed');
      }

      setFeed(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshFeed = async () => {
    setIsRefreshing(true);
    setError(null);

    try {
      const response = await fetch(`/api/feeds/${feedId}`, {
        method: 'PUT',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to refresh feed');
      }

      setFeed(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (feedId) {
      fetchFeed();
    }
  }, [feedId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">Loading feed...</div>
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
            <Link href="/feeds" className="text-indigo-600 hover:text-indigo-800">
              &larr; Back to feeds
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!feed) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">Feed not found</div>
          <div className="mt-4 text-center">
            <Link href="/feeds" className="text-indigo-600 hover:text-indigo-800">
              &larr; Back to feeds
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
          <Link href="/feeds" className="text-indigo-600 hover:text-indigo-800">
            &larr; Back to feeds
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{feed.title}</h1>
              <p className="text-gray-500 mt-1 break-all">{feed.url}</p>
              {feed.lastFetchedAt && (
                <p className="text-sm text-gray-500 mt-2">
                  Last updated: {new Date(feed.lastFetchedAt).toLocaleString()}
                </p>
              )}
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={refreshFeed}
                disabled={isRefreshing}
                className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isRefreshing ? 'Refreshing...' : 'Refresh Feed'}
              </button>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-4">Articles</h2>
        <ArticleList feedId={feedId} />
      </main>
    </div>
  );
}