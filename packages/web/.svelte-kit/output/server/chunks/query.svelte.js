import { m as sanitize_props, n as spread_props, o as slot, x as getContext } from "./index.js";
import { I as Icon } from "./Icon.js";
import { table, string, boolean, number, enumeration, relationships, createSchema, definePermissions, NOBODY_CAN, ANYONE_CAN, Zero } from "@rocicorp/zero";
function Share_2($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    ["circle", { "cx": "18", "cy": "5", "r": "3" }],
    ["circle", { "cx": "6", "cy": "12", "r": "3" }],
    [
      "circle",
      { "cx": "18", "cy": "19", "r": "3" }
    ],
    [
      "line",
      {
        "x1": "8.59",
        "x2": "15.42",
        "y1": "13.51",
        "y2": "17.49"
      }
    ],
    [
      "line",
      {
        "x1": "15.41",
        "x2": "8.59",
        "y1": "6.51",
        "y2": "10.49"
      }
    ]
  ];
  Icon($$payload, spread_props([
    { name: "share-2" },
    $$sanitized_props,
    {
      iconNode,
      children: ($$payload2) => {
        $$payload2.out += `<!---->`;
        slot($$payload2, $$props, "default", {});
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
}
function X($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    ["path", { "d": "M18 6 6 18" }],
    ["path", { "d": "m6 6 12 12" }]
  ];
  Icon($$payload, spread_props([
    { name: "x" },
    $$sanitized_props,
    {
      iconNode,
      children: ($$payload2) => {
        $$payload2.out += `<!---->`;
        slot($$payload2, $$props, "default", {});
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
}
const PUBLIC_ZERO_SERVER = "https://zchat-zero.grbn.dev";
const users = table("users").columns({
  id: string(),
  name: string(),
  username: string(),
  githubId: string()
}).primaryKey("id");
const chatAccess = table("chat_access").columns({
  id: string(),
  chatId: string(),
  userId: string(),
  write: boolean()
}).primaryKey("id");
const chat = table("chats").columns({
  id: string(),
  title: string(),
  description: string().optional(),
  public: boolean(),
  locked: boolean(),
  userId: string(),
  createdAt: number(),
  updatedAt: number()
}).primaryKey("id");
const message = table("messages").columns({
  id: string(),
  chatId: string(),
  userId: string().optional(),
  role: enumeration(),
  createdAt: number()
}).primaryKey("id");
const messageChunk = table("message_chunks").columns({
  messageId: string(),
  index: number(),
  content: string()
}).primaryKey("messageId", "index");
const usersRelationships = relationships(users, ({ many }) => ({
  chats: many({
    sourceField: ["id"],
    destField: ["userId"],
    destSchema: chat
  }),
  messages: many({
    sourceField: ["id"],
    destField: ["userId"],
    destSchema: message
  }),
  chatAccess: many({
    sourceField: ["id"],
    destField: ["userId"],
    destSchema: chatAccess
  })
}));
const chatAccessRelationships = relationships(chatAccess, ({ one }) => ({
  chat: one({
    sourceField: ["chatId"],
    destField: ["id"],
    destSchema: chat
  }),
  user: one({
    sourceField: ["userId"],
    destField: ["id"],
    destSchema: users
  })
}));
const chatRelationships = relationships(chat, ({ many, one }) => ({
  messages: many({
    sourceField: ["id"],
    destField: ["chatId"],
    destSchema: message
  }),
  chatAccess: many({
    sourceField: ["id"],
    destField: ["chatId"],
    destSchema: chatAccess
  }),
  user: one({
    sourceField: ["userId"],
    destField: ["id"],
    destSchema: users
  })
}));
const messageRelationships = relationships(message, ({ one, many }) => ({
  chat: one({
    sourceField: ["chatId"],
    destField: ["id"],
    destSchema: chat
  }),
  user: one({
    sourceField: ["userId"],
    destField: ["id"],
    destSchema: users
  }),
  chunks: many({
    sourceField: ["id"],
    destField: ["messageId"],
    destSchema: messageChunk
  })
}));
const messageChunkRelationships = relationships(messageChunk, ({ one }) => ({
  message: one({
    sourceField: ["messageId"],
    destField: ["id"],
    destSchema: message
  })
}));
const schema = createSchema(1, {
  tables: [
    chat,
    message,
    chatAccess,
    users,
    messageChunk
  ],
  relationships: [
    chatRelationships,
    messageRelationships,
    chatAccessRelationships,
    usersRelationships,
    messageChunkRelationships
  ]
});
function isOwnedByUser(authData, eb) {
  return eb.cmp("userId", authData.sub);
}
function canReadChat(authData, eb) {
  return eb.or(
    eb.exists("chatAccess", (q) => q.where("userId", authData.sub)),
    isOwnedByUser(authData, eb),
    eb.cmp("public", true)
  );
}
function canWriteToChat(authData, eb) {
  return eb.and(
    eb.cmp("locked", false),
    eb.or(
      eb.exists("chatAccess", (q) => q.where("userId", authData.sub).where("write", true)),
      isOwnedByUser(authData, eb)
    )
  );
}
function canReadInSameChat(authData, eb) {
  return eb.exists("chat", (q) => q.where((eq) => canReadChat(authData, eq)));
}
function canWriteInSameChat(authData, eb) {
  return eb.exists("chat", (q) => q.where((eq) => canWriteToChat(authData, eq)));
}
function canWriteMessages(authData, eb) {
  return eb.exists("chat", (q) => q.where((eq) => canWriteToChat(authData, eq)));
}
function canReadMessages(authData, eb) {
  return eb.exists("chat", (q) => q.where((eq) => canReadChat(authData, eq)));
}
function canReadMessageChunks(authData, eb) {
  return eb.exists("message", (q) => q.where((eq) => canReadMessages(authData, eq)));
}
function canWriteMessageChunks(authData, eb) {
  return eb.exists("message", (q) => q.where(
    (eq) => eq.and(
      eq.cmp("userId", authData.sub),
      eq.exists("chat", (eq2) => eq2.where("locked", false))
    )
  ));
}
definePermissions(schema, () => ({
  users: {
    row: {
      select: ANYONE_CAN,
      insert: ANYONE_CAN,
      update: {
        preMutation: NOBODY_CAN,
        postMutation: NOBODY_CAN
      },
      delete: NOBODY_CAN
    }
  },
  chats: {
    row: {
      select: [canReadChat],
      insert: [canWriteToChat],
      update: {
        preMutation: [canWriteToChat],
        postMutation: [canWriteToChat]
      },
      delete: [isOwnedByUser]
    }
  },
  chat_access: {
    row: {
      select: [canReadInSameChat],
      insert: [canWriteInSameChat],
      update: {
        preMutation: [canWriteInSameChat],
        postMutation: [canWriteInSameChat]
      },
      delete: [canWriteInSameChat]
    }
  },
  messages: {
    row: {
      select: [canReadMessages],
      insert: [canWriteMessages],
      update: {
        preMutation: [canWriteMessages],
        postMutation: [canWriteMessages]
      },
      delete: [canWriteMessages]
    }
  },
  message_chunks: {
    row: {
      select: [canReadMessageChunks],
      insert: [canWriteMessageChunks],
      update: {
        preMutation: NOBODY_CAN,
        postMutation: NOBODY_CAN
      },
      delete: NOBODY_CAN
    }
  }
}));
class Z {
  current = null;
  constructor(z_options) {
    this.build(z_options);
  }
  build(z_options) {
    this.current = new Zero(z_options);
  }
  close() {
    this.current.close();
  }
}
function createSubscriber(_) {
  return () => {
  };
}
const objectPrototypeHasOwnProperty = Object.prototype.hasOwnProperty;
const hasOwn = Object.hasOwn || ((object, key) => objectPrototypeHasOwnProperty.call(object, key));
function deepClone(value) {
  const seen = [];
  return internalDeepClone(value, seen);
}
function internalDeepClone(value, seen) {
  switch (typeof value) {
    case "boolean":
    case "number":
    case "string":
    case "undefined":
      return value;
    case "object": {
      if (value === null) {
        return null;
      }
      if (seen.includes(value)) {
        throw new Error("Cyclic object");
      }
      seen.push(value);
      if (Array.isArray(value)) {
        const rv = value.map((v) => internalDeepClone(v, seen));
        seen.pop();
        return rv;
      }
      const obj = {};
      for (const k in value) {
        if (hasOwn(value, k)) {
          const v = value[k];
          if (v !== void 0) {
            obj[k] = internalDeepClone(v, seen);
          }
        }
      }
      seen.pop();
      return obj;
    }
    default:
      throw new Error(`Invalid type: ${typeof value}`);
  }
}
const emptyArray = [];
const defaultSnapshots = {
  singular: [void 0, { type: "unknown" }],
  plural: [emptyArray, { type: "unknown" }]
};
function getDefaultSnapshot(singular) {
  return singular ? defaultSnapshots.singular : defaultSnapshots.plural;
}
class ViewWrapper {
  query;
  onMaterialized;
  onDematerialized;
  #view;
  #snapshot;
  #subscribe;
  constructor(query, onMaterialized, onDematerialized) {
    this.query = query;
    this.onMaterialized = onMaterialized;
    this.onDematerialized = onDematerialized;
    this.#snapshot = getDefaultSnapshot(query.format.singular);
    this.#subscribe = createSubscriber();
  }
  #onData = (snap, resultType, update) => {
    const data = snap === void 0 ? snap : deepClone(snap);
    this.#snapshot = [data, { type: resultType }];
    update();
  };
  #materializeIfNeeded() {
    if (!this.#view) {
      this.#view = this.query.materialize();
      this.onMaterialized(this);
    }
  }
  // Used in Svelte components
  get current() {
    this.#subscribe();
    return this.#snapshot;
  }
}
class ViewStore {
  // eslint-disable-next-line
  #views = /* @__PURE__ */ new Map();
  getView(clientID, query, enabled = true) {
    if (!enabled) {
      return new ViewWrapper(query, () => {
      }, () => {
      });
    }
    const hash = query.hash() + clientID;
    let existing = this.#views.get(hash);
    if (!existing) {
      existing = new ViewWrapper(
        query,
        (view) => {
          const lastView = this.#views.get(hash);
          if (lastView && lastView !== view) {
            throw new Error("View already exists");
          }
          this.#views.set(hash, view);
        },
        () => this.#views.delete(hash)
      );
      this.#views.set(hash, existing);
    }
    return existing;
  }
}
const viewStore = new ViewStore();
class Query {
  current = null;
  details = null;
  #query_impl;
  constructor(query, enabled = true) {
    const z2 = getContext("z");
    const id = z2?.current?.userID ? z2?.current.userID : "anon";
    this.#query_impl = query;
    const default_snapshot = getDefaultSnapshot(this.#query_impl.format.singular);
    this.current = default_snapshot[0];
    this.details = default_snapshot[1];
    const view = viewStore.getView(id, this.#query_impl, enabled);
    this.current = view.current[0];
    this.details = view.current[1];
  }
}
let userID = "anon";
const token = document.cookie.split(";").find((c) => c.trim().startsWith("auth="))?.split("=")[1];
if (token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    userID = payload.sub;
  } catch (e) {
    console.error("Failed to decode JWT token:", e);
  }
}
const z = new Z({
  userID,
  auth: () => token,
  server: PUBLIC_ZERO_SERVER,
  schema,
  kvStore: "idb"
});
function useQuery(queryFactory, enabled = true) {
  let query = new Query(queryFactory(), enabled);
  return new Proxy({}, {
    get(target, prop) {
      return query[prop];
    }
  });
}
export {
  Share_2 as S,
  X,
  useQuery as u,
  z
};
