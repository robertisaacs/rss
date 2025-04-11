import Header from '@/components/Header';
import ArticleList from '@/components/ArticleList';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI-Augmented RSS Feed Reader</h1>
          <p className="text-gray-600 mb-4">
            A personalized, algorithm-free content consumption tool with AI-assisted summarization and tagging.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/feeds" 
              className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Manage Feeds
            </Link>
            <Link 
              href="/search" 
              className="bg-white text-indigo-600 border border-indigo-600 py-2 px-4 rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Semantic Search
            </Link>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Articles</h2>
        <ArticleList />
      </main>
    </div>
  );
}
