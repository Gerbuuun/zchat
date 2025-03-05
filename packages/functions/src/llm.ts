import { OpenAI } from 'openai';
import { Resource } from 'sst';
import { eq } from 'drizzle-orm';
import { ulid } from 'ulid';
import { getDB, chats, messages } from 'zchat-database';

export async function handler(event: any) {
  const { chatId } = event;
  const db = getDB();

  try {
    // Get all previous messages for context
    const chatMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.chatId, chatId));

    // Create AI message in database first
    // TODO: Also do this on the client side for even more local first feel
    const assistantMessageId = ulid();
    await db.insert(messages).values({
      id: assistantMessageId,
      chatId,
      role: 'assistant',
      content: '',
      createdAt: new Date(),
    });

    // Stream paragraphs into database
    await streamChunkedParagraphs(db, assistantMessageId, chatMessages);

    // Generate title if the chat just started
    if (chatMessages.length === 1) {
      const title = await generateTitle(chatMessages[0]);
      await db.update(chats).set({ title }).where(eq(chats.id, chatId));
    }
  }
  catch (error) {
    console.error('Error generating AI response:', error);
  }
  finally {
    // Unlock the chat
    await db.update(chats).set({ locked: false }).where(eq(chats.id, chatId));
  }
}

/**
 * Takes the message history and streams the AI response in chunks into the database
 *
 * @param db - The database to use
 * @param messageId - The ID of the message to stream
 * @param chatMessages - The message history
 */
export async function streamChunkedParagraphs(db: ReturnType<typeof getDB>, messageId: string, chatMessages: { role: 'user' | 'assistant'; content: string }[]) {
  const openai = new OpenAI({ apiKey: Resource.OPENAI_API_KEY.value });

  try {
    let content = '';

    // Create streaming completion
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: chatMessages,
      stream: true,
    });

    // Process the stream
    for await (const chunk of completion) {
      const contentChunk = chunk.choices[0]?.delta?.content || '';

      if (contentChunk) {
        content += contentChunk;

        await db.update(messages).set({ content }).where(eq(messages.id, messageId));
      }
    }
    return true;
  }
  catch (error) {
    console.error('Error in streaming response:', error);
    return false;
  }
}

/**
 * Generates a title for a chat
 *
 * @param message - The initial message
 * @param message.role - The message role
 * @param message.content - The message content
 * @returns The title
 */
export async function generateTitle(message: { role: 'user' | 'assistant'; content: string }) {
  const openai = new OpenAI({ apiKey: Resource.OPENAI_API_KEY.value });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You generate a very short title for a chat based on the user\'s request. Give the title as is, without any additional text or formatting.' },
        message,
      ],
    });

    return completion.choices[0]?.message?.content ?? 'New Chat';
  }
  catch (error) {
    console.error('Error in generating title:', error);
    return 'New Chat';
  }
}
