'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Feed {
  id: number;
  title: string;
  url: string;
  lastFetchedAt: string | null;
}

export default function FeedList() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeeds = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/feeds');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch feeds');
      }

      setFeeds(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  const handleRefresh = async (id: number) => {
    try {
      const response = await fetch(`/api/feeds/${id}`, {
        method: 'PUT',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to refresh feed');
      }

      // Refresh the feeds list
      fetchFeeds();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this feed?')) {
      return;
    }

    try {
      const response = await fetch(`/api/feeds/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete feed');
      }

      // Refresh the feeds list
      fetchFeeds();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading feeds...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (feeds.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No feeds added yet. Add your first feed above.
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {feeds.map((feed) => (
          <li key={feed.id} className="p-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <Link href={`/feeds/${feed.id}`} className="text-lg font-medium text-indigo-600 hover:text-indigo-800">
                  {feed.title}
                </Link>
                <p className="text-sm text-gray-500 truncate">{feed.url}</p>
                {feed.lastFetchedAt && (
                  <p className="text-xs text-gray-400">
                    Last updated: {new Date(feed.lastFetchedAt).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleRefresh(feed.id)}
                  className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-md hover:bg-green-200"
                >
                  Refresh
                </button>
                <button
                  onClick={() => handleDelete(feed.id)}
                  className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-md hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}