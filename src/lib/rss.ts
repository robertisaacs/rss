import FeedParser from 'feedparser';
import { Readable } from 'stream';
import prisma from './prisma';
import { generateSummary, generateTags, generateEmbedding } from './openai';

// Interface for parsed RSS items
interface RSSItem {
  title: string;
  link: string;
  pubDate: Date;
  description: string;
  summary?: string;
}

// Function to fetch and parse an RSS feed
export async function fetchRSSFeed(feedUrl: string): Promise<RSSItem[]> {
  return new Promise((resolve, reject) => {
    const req = fetch(feedUrl);
    const feedparser = new FeedParser({});
    const items: RSSItem[] = [];

    req.then(res => {
      if (res.status !== 200) {
        reject(new Error(`Bad status code: ${res.status}`));
      } else {
        // Convert the response to a readable stream
        const stream = Readable.fromWeb(res.body as ReadableStream);
        stream.pipe(feedparser);
      }
    }).catch(error => {
      reject(error);
    });

    feedparser.on('error', (error: Error) => {
      reject(error);
    });

    feedparser.on('readable', function() {
      let item;
      while ((item = this.read())) {
        items.push({
          title: item.title,
          link: item.link,
          pubDate: item.pubDate,
          description: item.description || item.summary || '',
        });
      }
    });

    feedparser.on('end', () => {
      resolve(items);
    });
  });
}

// Function to add a new feed to the database
export async function addFeed(url: string, title: string) {
  return prisma.feed.create({
    data: {
      url,
      title,
      lastFetchedAt: new Date(),
    },
  });
}

// Function to process and store RSS items
export async function processRSSItems(feedId: number, items: RSSItem[]) {
  for (const item of items) {
    // Check if article already exists
    const existingArticle = await prisma.article.findUnique({
      where: { url: item.link },
    });

    if (!existingArticle) {
      // Generate AI summary and tags
      const summary = await generateSummary(item.description);
      const tags = await generateTags(item.description, item.title);
      const embedding = await generateEmbedding(`${item.title} ${item.description}`);
      
      // Create the article
      const article = await prisma.article.create({
        data: {
          feedId,
          title: item.title,
          url: item.link,
          publishedAt: item.pubDate,
          content: item.description,
          summary,
          embedding: embedding ? Buffer.from(new Float32Array(embedding).buffer) : undefined,
        },
      });

      // Create tags and associate them with the article
      for (const tagName of tags) {
        // Find or create the tag
        let tag = await prisma.tag.findUnique({
          where: { name: tagName },
        });

        if (!tag) {
          tag = await prisma.tag.create({
            data: { name: tagName },
          });
        }

        // Associate tag with article
        await prisma.articleTag.create({
          data: {
            articleId: article.id,
            tagId: tag.id,
          },
        });
      }
    }
  }

  // Update the lastFetchedAt timestamp for the feed
  await prisma.feed.update({
    where: { id: feedId },
    data: { lastFetchedAt: new Date() },
  });
}

// Function to fetch and process a feed
export async function fetchAndProcessFeed(feedId: number, feedUrl: string) {
  try {
    const items = await fetchRSSFeed(feedUrl);
    await processRSSItems(feedId, items);
    return { success: true, count: items.length };
  } catch (error) {
    console.error('Error fetching and processing feed:', error);
    return { success: false, error: (error as Error).message };
  }
}