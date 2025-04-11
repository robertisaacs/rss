import OpenAI from 'openai';

// Initialize the OpenAI client with the API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
});

// Function to generate a summary of an article
export async function generateSummary(content: string): Promise<string> {
  // Check if API key is a placeholder or not set
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('placeholder')) {
    console.log('Using placeholder summary as OpenAI API key is not configured');
    return 'AI summary not available - OpenAI API key not configured';
  }

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that summarizes articles concisely.',
        },
        {
          role: 'user',
          content: `Please summarize the following article in 2-3 sentences:\n\n${content}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 150,
    });

    return response.choices[0]?.message.content?.trim() || 'No summary available';
  } catch (error) {
    console.error('Error generating summary:', error);
    return 'Error generating summary';
  }
}

// Function to generate tags for an article
export async function generateTags(content: string, title: string): Promise<string[]> {
  // Check if API key is a placeholder or not set
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('placeholder')) {
    console.log('Using placeholder tags as OpenAI API key is not configured');
    return ['news', 'article'];
  }

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that generates relevant tags for articles.',
        },
        {
          role: 'user',
          content: `Please generate 3-5 relevant tags for the following article. Return only the tags as a comma-separated list with no additional text.\n\nTitle: ${title}\n\nContent: ${content}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 50,
    });

    const tagsText = response.choices[0]?.message.content?.trim() || '';
    return tagsText.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  } catch (error) {
    console.error('Error generating tags:', error);
    return ['error'];
  }
}

// Function to generate embeddings for semantic search
export async function generateEmbedding(text: string): Promise<number[] | null> {
  // Check if API key is a placeholder or not set
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('placeholder')) {
    console.log('Using placeholder embedding as OpenAI API key is not configured');
    // Return a simple placeholder embedding (just zeros)
    return Array(1536).fill(0);
  }

  try {
    const response = await openai.embeddings.create({
      model: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    return null;
  }
}

export default openai;