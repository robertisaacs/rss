import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/tags - Get all tags with article counts
export async function GET() {
  try {
    // Get all tags
    const tags = await prisma.tag.findMany();
    
    // Get article counts for each tag
    const tagCounts = await Promise.all(
      tags.map(async (tag) => {
        const count = await prisma.articleTag.count({
          where: { tagId: tag.id },
        });
        
        return {
          ...tag,
          articleCount: count,
        };
      })
    );
    
    // Sort tags by article count (descending)
    const sortedTags = tagCounts.sort((a, b) => b.articleCount - a.articleCount);
    
    return NextResponse.json(sortedTags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}