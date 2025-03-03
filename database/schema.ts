import { index, pgTable, primaryKey, uniqueIndex } from 'drizzle-orm/pg-core';

// User table
export const users = pgTable(
  'users',
  t => ({
    id: t.text().primaryKey(),
    githubId: t.text().notNull(),
    name: t.text().notNull(),
    username: t.text().notNull(),
  }),
  table => [
    uniqueIndex().on(table.githubId),
    uniqueIndex().on(table.username),
  ],
);

// Chat table
export const chats = pgTable(
  'chats',
  t => ({
    id: t.text().primaryKey(),
    title: t.text().notNull(),
    description: t.text(),
    public: t.boolean().notNull(),
    locked: t.boolean().notNull(),
    userId: t.text().notNull().references(() => users.id, { onDelete: 'cascade' }),
    createdAt: t.timestamp().notNull(),
    updatedAt: t.timestamp().notNull(),
  }),
  table => [
    index().on(table.userId),
  ],
);

// Chat access table
export const chatAccess = pgTable(
  'chat_access',
  t => ({
    id: t.text().primaryKey(),
    chatId: t.text().notNull().references(() => chats.id, { onDelete: 'cascade' }),
    userId: t.text().notNull().references(() => users.id, { onDelete: 'cascade' }),
    write: t.boolean().notNull(),
  }),
  table => [
    index().on(table.chatId),
    index().on(table.userId),
  ],
);

// Message table
export const messages = pgTable(
  'messages',
  t => ({
    id: t.text().primaryKey(),
    chatId: t.text().notNull().references(() => chats.id, { onDelete: 'cascade' }),
    userId: t.text().references(() => users.id, { onDelete: 'cascade' }),
    role: t.text({ enum: ['user', 'assistant'] }).notNull(),
    createdAt: t.timestamp().notNull(),
  }),
  table => [
    index().on(table.chatId),
    index().on(table.userId),
  ],
);

// Message chunk table
export const messageChunks = pgTable(
  'message_chunks',
  t => ({
    messageId: t.text().notNull().references(() => messages.id, { onDelete: 'cascade' }),
    index: t.integer().notNull(),
    content: t.text().notNull(),
  }),
  table => [
    primaryKey({ columns: [table.messageId, table.index] }),
  ],
);
