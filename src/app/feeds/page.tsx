'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import AddFeedForm from '@/components/AddFeedForm';
import FeedList from '@/components/FeedList';

export default function FeedsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleFeedAdded = () => {
    // Increment the key to force a refresh of the FeedList component
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage RSS Feeds</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <AddFeedForm onFeedAdded={handleFeedAdded} />
          </div>
          
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Feeds</h2>
            <FeedList key={refreshKey} />
          </div>
        </div>
      </main>
    </div>
  );
}