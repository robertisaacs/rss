import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/articles - Get all articles with optional filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tagId = searchParams.get('tagId');
    const query = searchParams.get('query');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build the where clause based on filters
    const where: any = {};

    // Filter by tag if provided
    if (tagId) {
      where.tags = {
        some: {
          tagId: parseInt(tagId),
        },
      };
    }

    // Filter by search query if provided
    if (query) {
      where.OR = [
        { title: { contains: query } },
        { content: { contains: query } },
        { summary: { contains: query } },
      ];
    }

    // Get total count for pagination
    const totalCount = await prisma.article.count({ where });

    // Get articles with pagination
    const articles = await prisma.article.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limit,
      include: {
        feed: {
          select: {
            id: true,
            title: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // Format the response
    const formattedArticles = articles.map(article => ({
      ...article,
      tags: article.tags.map(at => at.tag),
    }));

    return NextResponse.json({
      articles: formattedArticles,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}