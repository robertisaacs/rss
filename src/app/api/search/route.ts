import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateEmbedding } from '@/lib/openai';

// POST /api/search - Semantic search for articles
export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Generate embedding for the search query
    const embedding = await generateEmbedding(query);
    
    if (!embedding) {
      return NextResponse.json(
        { error: 'Failed to generate embedding for search query' },
        { status: 500 }
      );
    }

    // Get all articles with embeddings
    const articles = await prisma.article.findMany({
      where: {
        embedding: {
          not: null,
        },
      },
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

    // Calculate cosine similarity between query embedding and article embeddings
    const results = articles
      .map(article => {
        if (!article.embedding) return { article, similarity: 0 };
        
        const articleEmbedding = new Float32Array(
          article.embedding.buffer.slice(
            article.embedding.byteOffset,
            article.embedding.byteOffset + article.embedding.byteLength
          )
        );
        
        // Calculate cosine similarity
        let dotProduct = 0;
        let queryMagnitude = 0;
        let articleMagnitude = 0;
        
        for (let i = 0; i < embedding.length; i++) {
          dotProduct += embedding[i] * articleEmbedding[i];
          queryMagnitude += embedding[i] * embedding[i];
          articleMagnitude += articleEmbedding[i] * articleEmbedding[i];
        }
        
        const similarity = dotProduct / (Math.sqrt(queryMagnitude) * Math.sqrt(articleMagnitude));
        
        return {
          article: {
            ...article,
            tags: article.tags.map(at => at.tag),
          },
          similarity,
        };
      })
      .filter(result => result.similarity > 0.7) // Only return results with high similarity
      .sort((a, b) => b.similarity - a.similarity); // Sort by similarity (highest first)

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error performing semantic search:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}