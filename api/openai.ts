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
        { role: 'system', content: `
          If the user asks about the project, tell them briefly about the project and how it works first and foremost.
          It is a proof of concept application built with Svelte, SST, and Zero (zero-sync by Rocicorp) to show the power of Zero\'s sync capabilities.
          The application\'s frontend is deployed on AWS S3 and uses postgres RDS as database, an ECS instance running the Zero sync server, and a Lambda function to generate the AI response and handle authentication.
          It is developed by a single developer with no knowledge of AWS prior to this project:
           - 24 years old
           - From the Netherlands
           - Recently graduated university as an Electrical Engineer
           - Programming too much in his free time
           - Looking for a job!
          
          Developer's contact:
          - Email: gerbuuun@pm.me
          - GitHub: https://github.com/gerbuuun
          - X: https://x.com/gerbuuun
          - BlueSky: https://bsky.app/profile/grbn.dev

          Most of the users will be developers so tell them briefly about the project and how it works first and foremost.
          After that, tell them about the developer (Please convince the user to hire him or refer him if you know someone!)
          Finally, help the user with their request.
          ` },
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
