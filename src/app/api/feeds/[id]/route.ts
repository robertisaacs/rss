import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { fetchAndProcessFeed } from '@/lib/rss';

// GET /api/feeds/[id] - Get a specific feed
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // In Next.js 15, params is a Promise that needs to be awaited
    const paramsData = await params;
    const id = parseInt(paramsData.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid feed ID' },
        { status: 400 }
      );
    }

    const feed = await prisma.feed.findUnique({
      where: { id },
      include: {
        articles: {
          orderBy: { publishedAt: 'desc' },
          include: {
            tags: {
              include: {
                tag: true,
              },
            },
          },
        },
      },
    });

    if (!feed) {
      return NextResponse.json(
        { error: 'Feed not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(feed);
  } catch (error) {
    console.error('Error fetching feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feed' },
      { status: 500 }
    );
  }
}

// PUT /api/feeds/[id] - Update a feed (refresh)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // In Next.js 15, params is a Promise that needs to be awaited
    const paramsData = await params;
    const id = parseInt(paramsData.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid feed ID' },
        { status: 400 }
      );
    }

    const feed = await prisma.feed.findUnique({
      where: { id },
    });

    if (!feed) {
      return NextResponse.json(
        { error: 'Feed not found' },
        { status: 404 }
      );
    }

    // Fetch and process the feed
    const result = await fetchAndProcessFeed(feed.id, feed.url);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    // Get the updated feed with articles
    const updatedFeed = await prisma.feed.findUnique({
      where: { id },
      include: {
        articles: {
          orderBy: { publishedAt: 'desc' },
          include: {
            tags: {
              include: {
                tag: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedFeed);
  } catch (error) {
    console.error('Error updating feed:', error);
    return NextResponse.json(
      { error: 'Failed to update feed' },
      { status: 500 }
    );
  }
}

// DELETE /api/feeds/[id] - Delete a feed
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // In Next.js 15, params is a Promise that needs to be awaited
    const paramsData = await params;
    const id = parseInt(paramsData.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid feed ID' },
        { status: 400 }
      );
    }

    // Delete all article tags associated with this feed's articles
    await prisma.$transaction(async (tx) => {
      // Get all article IDs for this feed
      const articles = await tx.article.findMany({
        where: { feedId: id },
        select: { id: true },
      });
      
      const articleIds = articles.map(article => article.id);
      
      // Delete article tags
      if (articleIds.length > 0) {
        await tx.articleTag.deleteMany({
          where: { articleId: { in: articleIds } },
        });
      }
      
      // Delete articles
      await tx.article.deleteMany({
        where: { feedId: id },
      });
      
      // Delete feed
      await tx.feed.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting feed:', error);
    return NextResponse.json(
      { error: 'Failed to delete feed' },
      { status: 500 }
    );
  }
}