'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Tag {
  id: number;
  name: string;
}

interface Article {
  id: number;
  title: string;
  url: string;
  publishedAt: string;
  summary: string | null;
  feed: {
    id: number;
    title: string;
  };
  tags: Tag[];
}

interface SearchResult {
  article: Article;
  similarity: number;
}

export default function SemanticSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setResults(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Semantic Search</h2>
        <form onSubmit={handleSearch}>
          <div className="flex">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by meaning, not just keywords..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-indigo-600 text-white py-2 px-4 rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
        {error && (
          <div className="mt-4 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4">Search Results</h3>
          <div className="space-y-6">
            {results.map(({ article, similarity }) => (
              <div key={article.id} className="bg-white shadow rounded-lg p-6">
                <div className="mb-2 flex justify-between items-start">
                  <h2 className="text-xl font-semibold text-gray-900">
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600">
                      {article.title}
                    </a>
                  </h2>
                  <span className="text-sm text-gray-500">
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-600 mr-2">From:</span>
                    <Link href={`/feeds/${article.feed.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">
                      {article.feed.title}
                    </Link>
                  </div>
                  <div className="text-sm text-gray-600">
                    Relevance: {Math.round(similarity * 100)}%
                  </div>
                </div>
                
                {article.summary && (
                  <div className="mb-4 text-gray-700">
                    <h3 className="text-sm font-medium text-gray-900 mb-1">AI Summary:</h3>
                    <p>{article.summary}</p>
                  </div>
                )}
                
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <Link 
                        key={tag.id} 
                        href={`/tags/${tag.id}`}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                      >
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {query && !isLoading && results.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No results found for your query.
        </div>
      )}
    </div>
  );
}