import { Resource } from 'sst';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { chats, messageChunks, messages } from '../database/schema';
import { eq, sql } from 'drizzle-orm';
import { ulid } from 'ulid';
import { generateTitle, streamChunkedParagraphs } from './openai';

function getDB() {
  const client = postgres(`postgres://${Resource.Database.username}:${Resource.Database.password}@${Resource.Database.host}:${Resource.Database.port}/${Resource.Database.database}`);
  return drizzle(client);
}

export const handler = async (event: any) => {
  const { chatId } = event;
  const db = getDB();

  try {
    // Get all previous messages for context
    const chatMessages = await db
      .select({
        id: messages.id,
        role: messages.role,
        content: sql<string>`string_agg(${messageChunks.content}, '')`.as('content'),
      })
      .from(messages)
      .where(eq(messages.chatId, chatId))
      .innerJoin(messageChunks, eq(messages.id, messageChunks.messageId))
      .groupBy(messages.id);

    // Create AI message in database first
    // TODO: Also do this on the client side for even more local first feel
    const assistantMessageId = ulid();
    await db.insert(messages).values({
      id: assistantMessageId,
      chatId,
      role: 'assistant',
      createdAt: new Date(),
    });

    // Stream paragraphs into database
    await streamChunkedParagraphs(assistantMessageId, chatMessages, db);

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
  return;
}