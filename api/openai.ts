import type { Drizzle } from './index';
import { OpenAI } from 'openai';
import { Resource } from 'sst';
import { messageChunks } from '../database/schema';

// Generate AI response
const openaiApiKey = Resource.OPENAI_API_KEY.value;

export async function streamChunkedParagraphs(messageId: string, chatMessages: { role: 'user' | 'assistant'; content: string }[], db: Drizzle) {
  const openai = new OpenAI({
    apiKey: openaiApiKey,
  });

  try {
    let currentChunkContent = '';
    let chunkIndex = 0;

    // Create streaming completion
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that responds in short paragraphs.' },
        ...chatMessages,
      ],
      stream: true,
    });

    // Process the stream
    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content || '';

      if (content) {
        currentChunkContent += content;

        // Check if we have a complete paragraph (ends with newline or period)
        if (content.includes('\n\n') || (content.endsWith('.') && currentChunkContent.length > 180)) {
          // Save paragraph to database
          await db.insert(messageChunks).values({
            messageId,
            index: chunkIndex++,
            content: currentChunkContent,
          });

          // Reset paragraph
          currentChunkContent = '';
        }
      }
    }

    // Save any remaining content as the final chunk
    if (currentChunkContent) {
      await db.insert(messageChunks).values({
        messageId,
        index: chunkIndex,
        content: currentChunkContent,
      });
    }

    return true;
  }
  catch (error) {
    console.error('Error in streaming response:', error);
    return false;
  }
}

export async function generateTitle(initialMessage: { role: 'user' | 'assistant'; content: string }) {
  const openai = new OpenAI({
    apiKey: openaiApiKey,
  });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You generate a very short title for a chat based on the user\'s request. Give the title as is, without any additional text or formatting.' },
        initialMessage,
      ],
    });

    return completion.choices[0]?.message?.content ?? 'New Chat';
  }
  catch (error) {
    console.error('Error in generating title:', error);
    return 'New Chat';
  }
}
