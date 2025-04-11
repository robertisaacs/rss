'use client';

import { useState, useEffect } from 'react';
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

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface ArticleListProps {
  feedId?: number;
  tagId?: number;
  searchQuery?: string;
}

export default function ArticleList({ feedId, tagId, searchQuery }: ArticleListProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = async (page = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '10');
      
      if (tagId) {
        params.append('tagId', tagId.toString());
      }
      
      if (searchQuery) {
        params.append('query', searchQuery);
      }

      // Determine the endpoint
      let url = '/api/articles';
      if (feedId) {
        url = `/api/feeds/${feedId}`;
      }

      const response = await fetch(`${url}?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch articles');
      }

      if (feedId) {
        // If fetching from a specific feed
        setArticles(data.articles || []);
      } else {
        // If fetching from the articles endpoint
        setArticles(data.articles || []);
        setPagination(data.pagination || null);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles(1);
    setCurrentPage(1);
  }, [feedId, tagId, searchQuery]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchArticles(page);
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading articles...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No articles found.
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-6">
        {articles.map((article) => (
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
            
            {article.feed && (
              <div className="mb-3 flex items-center">
                <span className="text-sm text-gray-600 mr-2">From:</span>
                <Link href={`/feeds/${article.feed.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">
                  {article.feed.title}
                </Link>
              </div>
            )}
            
            {article.summary && (
              <div className="mb-4 text-gray-700">
                <h3 className="text-sm font-medium text-gray-900 mb-1">AI Summary:</h3>
                <p>{article.summary}</p>
              </div>
            )}
            
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  tag && tag.id && tag.name ? (
                    <Link 
                      key={tag.id} 
                      href={`/tags/${tag.id}`}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                    >
                      {tag.name}
                    </Link>
                  ) : null
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="inline-flex rounded-md shadow">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 border border-gray-300 text-sm font-medium ${
                  currentPage === page
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.pages}
              className="px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}