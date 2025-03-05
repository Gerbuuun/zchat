import type { ExpressionBuilder, Row } from '@rocicorp/zero';
import {
  ANYONE_CAN,
  boolean,
  createSchema,
  definePermissions,
  enumeration,
  NOBODY_CAN,
  number,
  relationships,
  string,
  table,
} from '@rocicorp/zero';

// Define tables
const users = table('users')
  .columns({
    id: string(),
    name: string(),
    username: string(),
    githubId: string(),
  })
  .primaryKey('id');

const chatAccess = table('chat_access')
  .columns({
    id: string(),
    chatId: string(),
    userId: string(),
    write: boolean(),
  })
  .primaryKey('id');

const chat = table('chats')
  .columns({
    id: string(),
    title: string(),
    description: string().optional(),
    public: boolean(),
    locked: boolean(),
    userId: string(),
    createdAt: number(),
    updatedAt: number(),
  })
  .primaryKey('id');

const message = table('messages')
  .columns({
    id: string(),
    chatId: string(),
    userId: string().optional(),
    role: enumeration(),
    content: string(),
    createdAt: number(),
  })
  .primaryKey('id');

// Define relationships
const usersRelationships = relationships(users, ({ many }) => ({
  chats: many({
    sourceField: ['id'],
    destField: ['userId'],
    destSchema: chat,
  }),
  messages: many({
    sourceField: ['id'],
    destField: ['userId'],
    destSchema: message,
  }),
  chatAccess: many({
    sourceField: ['id'],
    destField: ['userId'],
    destSchema: chatAccess,
  }),
}));

const chatAccessRelationships = relationships(chatAccess, ({ one }) => ({
  chat: one({
    sourceField: ['chatId'],
    destField: ['id'],
    destSchema: chat,
  }),
  user: one({
    sourceField: ['userId'],
    destField: ['id'],
    destSchema: users,
  }),
}));

const chatRelationships = relationships(chat, ({ many, one }) => ({
  messages: many({
    sourceField: ['id'],
    destField: ['chatId'],
    destSchema: message,
  }),
  chatAccess: many({
    sourceField: ['id'],
    destField: ['chatId'],
    destSchema: chatAccess,
  }),
  user: one({
    sourceField: ['userId'],
    destField: ['id'],
    destSchema: users,
  }),
}));

const messageRelationships = relationships(message, ({ one }) => ({
  chat: one({
    sourceField: ['chatId'],
    destField: ['id'],
    destSchema: chat,
  }),
  user: one({
    sourceField: ['userId'],
    destField: ['id'],
    destSchema: users,
  }),
}));

export const schema = createSchema(1, {
  tables: [
    chat,
    message,
    chatAccess,
    users,
  ],
  relationships: [
    chatRelationships,
    messageRelationships,
    chatAccessRelationships,
    usersRelationships,
  ],
});

type Schema = typeof schema;
export type Chat = Row<typeof schema.tables.chats>;
export type ChatAccess = Row<typeof schema.tables.chat_access>;
export type Message = Row<typeof schema.tables.messages>;
export type User = Row<typeof schema.tables.users>;

interface AuthData {
  sub: string;
}

// User
function isOwnedByUser(authData: AuthData, eb: ExpressionBuilder<Schema, 'chats' | 'chat_access' | 'messages'>) {
  return eb.cmp('userId', authData.sub);
}

// Chat
function canReadChat(authData: AuthData, eb: ExpressionBuilder<Schema, 'chats'>) {
  return eb.or(
    eb.exists('chatAccess', q => q.where('userId', authData.sub)),
    isOwnedByUser(authData, eb),
    eb.cmp('public', true),
  );
}

function canWriteToChat(authData: AuthData, eb: ExpressionBuilder<Schema, 'chats'>) {
  return eb.and(
    eb.cmp('locked', false),
    eb.or(
      eb.exists('chatAccess', q => q.where('userId', authData.sub).where('write', true)),
      isOwnedByUser(authData, eb),
    ),
  );
}

// Chat Access
function canReadInSameChat(authData: AuthData, eb: ExpressionBuilder<Schema, 'chat_access'>) {
  return eb.exists('chat', q => q.where(eq => canReadChat(authData, eq)));
}

function canWriteInSameChat(authData: AuthData, eb: ExpressionBuilder<Schema, 'chat_access'>) {
  return eb.exists('chat', q => q.where(eq => canWriteToChat(authData, eq)));
}

// Messages
function canWriteMessages(authData: AuthData, eb: ExpressionBuilder<Schema, 'messages'>) {
  return eb.exists('chat', q => q.where(eq => canWriteToChat(authData, eq)));
}

function canReadMessages(authData: AuthData, eb: ExpressionBuilder<Schema, 'messages'>) {
  return eb.exists('chat', q => q.where(eq => canReadChat(authData, eq)));
}

export const permissions = definePermissions<AuthData, typeof schema>(schema, () => ({
  users: {
    row: {
      select: ANYONE_CAN,
      insert: ANYONE_CAN,
      update: {
        preMutation: NOBODY_CAN,
        postMutation: NOBODY_CAN,
      },
      delete: NOBODY_CAN,
    },
  },
  chats: {
    row: {
      select: [canReadChat],
      insert: [canWriteToChat],
      update: {
        preMutation: [canWriteToChat],
        postMutation: [canWriteToChat],
      },
      delete: [isOwnedByUser],
    },
  },
  chat_access: {
    row: {
      select: [canReadInSameChat],
      insert: [canWriteInSameChat],
      update: {
        preMutation: [canWriteInSameChat],
        postMutation: [canWriteInSameChat],
      },
      delete: [canWriteInSameChat],
    },
  },
  messages: {
    row: {
      select: [canReadMessages],
      insert: [canWriteMessages],
      update: {
        preMutation: [canWriteMessages],
        postMutation: [canWriteMessages],
      },
      delete: [canWriteMessages],
    },
  },
}));
