import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { fetchRSSFeed, addFeed, processRSSItems } from '@/lib/rss';

// GET /api/feeds - Get all feeds
export async function GET() {
  try {
    const feeds = await prisma.feed.findMany({
      orderBy: { title: 'asc' },
    });
    
    return NextResponse.json(feeds);
  } catch (error) {
    console.error('Error fetching feeds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feeds' },
      { status: 500 }
    );
  }
}

// POST /api/feeds - Add a new feed
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: 'Feed URL is required' },
        { status: 400 }
      );
    }

    // Check if feed already exists
    const existingFeed = await prisma.feed.findUnique({
      where: { url },
    });

    if (existingFeed) {
      return NextResponse.json(
        { error: 'Feed already exists', feed: existingFeed },
        { status: 409 }
      );
    }

    // Fetch the feed to get its title and validate it works
    try {
      const items = await fetchRSSFeed(url);
      const feedTitle = items[0]?.title || 'Untitled Feed';
      
      // Add the feed to the database
      const feed = await addFeed(url, feedTitle);
      
      // Process the RSS items
      await processRSSItems(feed.id, items);
      
      return NextResponse.json(feed, { status: 201 });
    } catch (error) {
      console.error('Error fetching RSS feed:', error);
      return NextResponse.json(
        { error: 'Invalid RSS feed URL' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error adding feed:', error);
    return NextResponse.json(
      { error: 'Failed to add feed' },
      { status: 500 }
    );
  }
}