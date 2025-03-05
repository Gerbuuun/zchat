import { m as sanitize_props, n as spread_props, o as slot, q as ensure_array_like, t as escape_html, l as pop, p as push, u as attr, v as stringify, w as head } from "../../chunks/index.js";
import { g as goto } from "../../chunks/client.js";
import { p as page } from "../../chunks/index2.js";
import { P as Plus, G as Github_icon } from "../../chunks/plus.js";
import { z, u as useQuery, S as Share_2, X } from "../../chunks/query.svelte.js";
import { I as Icon } from "../../chunks/Icon.js";
import { ulid } from "ulid";
function Menu($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "line",
      {
        "x1": "4",
        "x2": "20",
        "y1": "12",
        "y2": "12"
      }
    ],
    [
      "line",
      { "x1": "4", "x2": "20", "y1": "6", "y2": "6" }
    ],
    [
      "line",
      {
        "x1": "4",
        "x2": "20",
        "y1": "18",
        "y2": "18"
      }
    ]
  ];
  Icon($$payload, spread_props([
    { name: "menu" },
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
function Message_square_text($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "path",
      {
        "d": "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
      }
    ],
    ["path", { "d": "M13 8H7" }],
    ["path", { "d": "M17 12H7" }]
  ];
  Icon($$payload, spread_props([
    { name: "message-square-text" },
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
function Messages_square($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "path",
      {
        "d": "M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z"
      }
    ],
    [
      "path",
      {
        "d": "M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"
      }
    ]
  ];
  Icon($$payload, spread_props([
    { name: "messages-square" },
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
function Pencil($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "path",
      {
        "d": "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"
      }
    ],
    ["path", { "d": "m15 5 4 4" }]
  ];
  Icon($$payload, spread_props([
    { name: "pencil" },
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
function Power($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    ["path", { "d": "M12 2v10" }],
    [
      "path",
      { "d": "M18.4 6.6a9 9 0 1 1-12.77.04" }
    ]
  ];
  Icon($$payload, spread_props([
    { name: "power" },
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
function Search($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "circle",
      { "cx": "11", "cy": "11", "r": "8" }
    ],
    ["path", { "d": "m21 21-4.3-4.3" }]
  ];
  Icon($$payload, spread_props([
    { name: "search" },
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
function Chat_match($$payload, $$props) {
  push();
  const { chat, search } = $$props;
  $$payload.out += `<div class="flex items-start gap-2"><div class="flex-shrink-0 py-1.5">`;
  if (chat.userId === z.current.userID) {
    $$payload.out += "<!--[-->";
    Message_square_text($$payload, { size: 20 });
  } else {
    $$payload.out += "<!--[!-->";
    Messages_square($$payload, { size: 20 });
  }
  $$payload.out += `<!--]--></div> <div class="overflow-hidden"><h4 class="font-medium text-gray-800 truncate">`;
  if (chat.title.toLowerCase().includes(search.toLowerCase())) {
    $$payload.out += "<!--[-->";
    const parts = chat.title.split(new RegExp(`(${search})`, "i"));
    const each_array = ensure_array_like(parts);
    $$payload.out += `<!--[-->`;
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let part = each_array[$$index];
      if (part.toLowerCase() === search.toLowerCase()) {
        $$payload.out += "<!--[-->";
        $$payload.out += `<span class="bg-yellow-200">${escape_html(part)}</span>`;
      } else {
        $$payload.out += "<!--[!-->";
        $$payload.out += `${escape_html(part)}`;
      }
      $$payload.out += `<!--]-->`;
    }
    $$payload.out += `<!--]-->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `${escape_html(chat.title)}`;
  }
  $$payload.out += `<!--]--></h4> `;
  if (chat.messages && chat.messages.length > 0) {
    $$payload.out += "<!--[-->";
    const matchingChunk = chat.messages.flatMap((m) => m.chunks || []).find((chunk) => chunk.content.toLowerCase().includes(search.toLowerCase()));
    if (matchingChunk) {
      $$payload.out += "<!--[-->";
      const parts = matchingChunk.content.split(new RegExp(`(${search})`, "i"));
      const each_array_1 = ensure_array_like(parts);
      $$payload.out += `<p class="text-sm text-gray-500 line-clamp-2"><!--[-->`;
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let part = each_array_1[$$index_1];
        if (part.toLowerCase() === search.toLowerCase()) {
          $$payload.out += "<!--[-->";
          $$payload.out += `<span class="bg-yellow-200">${escape_html(part)}</span>`;
        } else {
          $$payload.out += "<!--[!-->";
          $$payload.out += `${escape_html(part)}`;
        }
        $$payload.out += `<!--]-->`;
      }
      $$payload.out += `<!--]--></p>`;
    } else if (chat.description) {
      $$payload.out += "<!--[1-->";
      $$payload.out += `<p class="text-sm text-gray-500 line-clamp-2">${escape_html(chat.description)}</p>`;
    } else {
      $$payload.out += "<!--[!-->";
    }
    $$payload.out += `<!--]-->`;
  } else if (chat.description) {
    $$payload.out += "<!--[1-->";
    $$payload.out += `<p class="text-sm text-gray-500 line-clamp-2">${escape_html(chat.description)}</p>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--></div></div>`;
  pop();
}
function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "fixed top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg z-50";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("opacity-0", "transition-opacity", "duration-300");
    setTimeout(() => document.body.removeChild(toast), 300);
  }, 3e3);
}
function Search_1($$payload, $$props) {
  push();
  let search = "";
  let selectedIndex = 0;
  const chats = useQuery(() => z.current.query.chats.where((q) => q.or(q.cmp("userId", z.current.userID), q.exists("chatAccess", (q2) => q2.where("userId", z.current.userID)))).where("title", "ILIKE", `%${search}%`).related("messages", (q) => q.related("chunks")));
  const messages = useQuery(() => z.current.query.messages.whereExists("chat", (q) => q.where((q2) => q2.or(q2.cmp("userId", z.current.userID), q2.exists("chatAccess", (q3) => q3.where("userId", z.current.userID))))).whereExists("chunks", (q) => q.where("content", "ILIKE", `%${search}%`)).related("chunks").related("chat"));
  const chatIds = /* @__PURE__ */ new Set([
    ...chats.current.map((c) => c.id),
    ...messages.current.map((m) => m.chatId)
  ]);
  const matchedChats = useQuery(() => z.current.query.chats.where("id", "IN", Array.from(chatIds)).related("messages", (q) => q.related("chunks")));
  const shortCuts = [
    {
      label: "New Chat",
      icon: Messages_square,
      action: () => {
        goto(`/${ulid()}`).then(() => document.querySelector("textarea")?.focus());
      }
    },
    {
      label: "Share Chat",
      icon: Share_2,
      action: () => {
        const currentChatId = page.params.chatId;
        if (currentChatId) {
          z.current.mutate.chats.update({ id: currentChatId, public: true });
          navigator.clipboard.writeText(`${window.location.origin}/${currentChatId}`).then(() => showToast("Link copied to clipboard!"));
        }
      }
    },
    {
      label: "Edit Title",
      icon: Pencil,
      action: () => {
        const currentChatId = page.params.chatId;
        if (currentChatId) {
          const chat = z.current.query.chats.where("id", currentChatId).one().materialize();
          if (chat) {
            const newTitle = prompt("Edit chat title:", chat.data?.title ?? "New Chat");
            if (newTitle && newTitle.trim() !== "" && newTitle !== chat.data?.title) {
              z.current.mutate.chats.update({ id: currentChatId, title: newTitle.trim() }).then(() => showToast("Chat title updated!"));
            }
          }
        }
      }
    },
    // {
    //   label: 'Add User',
    //   icon: Plus,
    //   action: () => {
    //     const currentChatId = page.params.chatId;
    //     if (currentChatId) {
    //       // TODO: Add user to chat
    //       modal?.close();
    //     }
    //   },
    // },
    {
      label: "Delete Chat",
      icon: X,
      action: () => {
        const currentChatId = page.params.chatId;
        goto();
        z.current.mutate.chats.delete({ id: currentChatId });
      }
    }
  ];
  const filteredShortcuts = shortCuts.filter((s) => search.length === 0 || s.label.toLowerCase().includes(search.toLowerCase()));
  const navigableItems = (() => {
    const items = [];
    filteredShortcuts.forEach((_, index) => {
      items.push({ type: "shortcut", index });
    });
    if (search.length > 0 && matchedChats.current.length > 0) {
      matchedChats.current.forEach((_, index) => {
        items.push({ type: "chat", index });
      });
    }
    return items;
  })();
  function isSelected(type, index) {
    const selectedItem = navigableItems[selectedIndex];
    return selectedItem && selectedItem.type === type && selectedItem.index === index;
  }
  $$payload.out += `<div class="max-w-md grow"><div class="relative"><button type="button" class="hidden md:flex w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent text-left text-gray-500">Search...</button> <div class="hidden md:block absolute left-3 top-2.5 text-gray-400">`;
  Search($$payload, { size: 20 });
  $$payload.out += `<!----></div> <button class="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 active:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-400" aria-label="Search">`;
  Search($$payload, { size: 20 });
  $$payload.out += `<!----></button></div> <dialog id="searchModal" class="max-h-full md:rounded-lg shadow-lg w-full max-w-xl md:mx-auto md:mt-[20vh] inset-0 h-full m-0 md:h-fit"><div class="relative p-1 mb-2 border-b border-gray-200"><input type="search"${attr("value", search)} placeholder="Type to search..." class="w-full pl-10 pr-4 py-2 focus:outline-none focus:border-transparent" autofocus> <div class="absolute left-4 top-3.5 text-gray-400">`;
  Search($$payload, { size: 20 });
  $$payload.out += `<!----></div> <div class="absolute right-4 top-3.5 text-gray-400"><button class="text-gray-500 hover:text-gray-700" aria-label="Close search modal">`;
  X($$payload, { size: 20 });
  $$payload.out += `<!----></button></div></div> <div class="max-h-100 overflow-auto">`;
  if (filteredShortcuts.length > 0) {
    $$payload.out += "<!--[-->";
    const each_array = ensure_array_like(filteredShortcuts);
    $$payload.out += `<div class="flex flex-col text-gray-500 p-2"><div class="ps-3 text-sm font-medium pb-1">Shortcuts</div> <!--[-->`;
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      let shortcut = each_array[i];
      $$payload.out += `<button${attr("class", `flex items-center gap-2 py-1 px-3 rounded-md ${stringify(isSelected("shortcut", i) ? "bg-gray-100" : "")} focus:bg-gray-100 focus:outline-none transition-colors duration-200 w-full text-left`)}${attr("data-selected", isSelected("shortcut", i))}><!---->`;
      shortcut.icon($$payload, { size: 20 });
      $$payload.out += `<!----> ${escape_html(shortcut.label)}</button>`;
    }
    $$payload.out += `<!--]--></div>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--> `;
  if (search.length > 0) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="flex flex-col text-gray-500 p-2">`;
    if (matchedChats.current.length > 0) {
      $$payload.out += "<!--[-->";
      const each_array_1 = ensure_array_like(matchedChats.current);
      $$payload.out += `<div class="ps-3 text-sm font-medium pb-1">Chats</div> <ul class="divide-y divide-gray-200"><!--[-->`;
      for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
        let chat = each_array_1[i];
        $$payload.out += `<li><a${attr("href", `/${chat.id}`)}${attr("class", `flex items-center gap-2 py-1 px-3 rounded-md ${stringify(isSelected("chat", i) ? "bg-gray-100" : "")} focus:bg-gray-100 focus:outline-none transition-colors duration-200 w-full text-left`)}${attr("data-selected", isSelected("chat", i))}>`;
        Chat_match($$payload, { chat, search });
        $$payload.out += `<!----></a></li>`;
      }
      $$payload.out += `<!--]--></ul>`;
    } else {
      $$payload.out += "<!--[!-->";
      $$payload.out += `<p class="text-center p-4 text-gray-500"><span class="text-gray-500">No results found for</span> "<span class="inline-block max-w-[200px] truncate align-bottom">${escape_html(search)}</span>"</p>`;
    }
    $$payload.out += `<!--]--></div>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--></div></dialog></div>`;
  pop();
}
function chatList($$payload, label, chats) {
  if (chats.length > 0) {
    $$payload.out += "<!--[-->";
    const each_array = ensure_array_like(chats);
    $$payload.out += `<div><h2 class="text-sm uppercase tracking-wider text-gray-400 font-semibold px-2 mb-2">${escape_html(label)}</h2> <ul class="space-y-2"><!--[-->`;
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let chat = each_array[$$index];
      $$payload.out += `<li><a${attr("href", `/${chat.id}`)}${attr("class", `block p-2 rounded hover:bg-gray-700 ${stringify(page.url.pathname === `/${chat.id}` ? "bg-gray-700" : "")}`)}><span class="flex items-center gap-2">`;
      if (chat.userId === z.current.userID) {
        $$payload.out += "<!--[-->";
        Message_square_text($$payload, { size: 20 });
      } else {
        $$payload.out += "<!--[!-->";
        Messages_square($$payload, { size: 20 });
      }
      $$payload.out += `<!--]--> ${escape_html(chat.title)}</span></a></li>`;
    }
    $$payload.out += `<!--]--></ul></div>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
}
function _layout($$payload, $$props) {
  push();
  const { children } = $$props;
  const loggedIn = !!document.cookie.split("; ").find((row) => row.startsWith("auth="))?.split("=")[1];
  z.current.query.chats.where((q) => q.or(q.cmp("userId", z.current.userID), q.exists("chatAccess", (q2) => q2.where("userId", z.current.userID)))).related("messages", (q) => q.related("chunks")).related("chatAccess").related("user").preload();
  const user = useQuery(() => z.current.query.users.where("id", z.current.userID).one());
  const chats = useQuery(() => z.current.query.chats.where("userId", z.current.userID));
  const sharedChats = useQuery(() => z.current.query.chats.whereExists("chatAccess", (q) => q.where("userId", z.current.userID)));
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>ZChat</title>`;
    $$payload2.out += `<meta name="description" content="ZChat is a proof of concept LLM chat application built with Zero and Svelte and deployed on AWS using SST.">`;
  });
  $$payload.out += `<div class="min-h-dvh bg-gray-100"><aside${attr("class", `fixed left-0 inset-y-0 z-50 w-64 bg-gray-800 text-white ${stringify("-translate-x-full")} md:translate-x-0 transition-transform duration-300 ease-in-out`)}><div class="h-16 px-4 border-b border-gray-700 flex justify-between items-center"><a href="/" class="flex items-center gap-2"><div class="bg-[url(&quot;/favicon.png&quot;)] bg-contain bg-no-repeat size-5"></div> <h1 class="text-xl font-bold">ZChat</h1></a> <button class="md:hidden p-2 rounded-md text-white active:bg-gray-700 focus:outline-none" aria-label="close sidebar">`;
  X($$payload, {});
  $$payload.out += `<!----></button></div> <nav class="p-2 space-y-4"><button class="p-2 rounded hover:bg-gray-700 w-full"><span class="flex items-center gap-2">`;
  Plus($$payload, {});
  $$payload.out += `<!----> Create New Chat</span></button> `;
  chatList($$payload, "My Chats", chats.current);
  $$payload.out += `<!----> `;
  chatList($$payload, "Shared With Me", sharedChats.current);
  $$payload.out += `<!----></nav></aside> <div class="fixed inset-0 flex flex-col flex-1 md:ml-64"><header class="bg-white shadow-sm"><div class="flex items-center h-16 px-4 gap-4"><button class="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 active:bg-gray-100 focus:outline-none" aria-label="toggle sidebar">`;
  Menu($$payload, {});
  $$payload.out += `<!----></button> `;
  Search_1($$payload);
  $$payload.out += `<!----> `;
  if (loggedIn) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="flex items-center gap-4 ml-auto"><span class="text-sm font-medium text-gray-700 hidden md:inline-block">${escape_html(user.current?.name)}</span> <img${attr("src", `https://github.com/${user.current?.username}.png`)} alt="Profile" class="size-8 rounded-full object-cover mr-2"></div> <button class="p-2 flex flex-row gap-2 items-center rounded-md text-white bg-[#FF3E00] hover:bg-[#FF5722] focus:outline-none focus:ring-2 focus:ring-[#FF3E00]"><span class="hidden md:inline-block">Logout</span> `;
    Power($$payload, { size: 20 });
    $$payload.out += `<!----></button>`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<a href="/api/auth" class="py-2 px-4 rounded-md text-white bg-[#FF3E00] hover:bg-[#FF5722] focus:outline-none focus:ring-2 focus:ring-[#FF3E00] inline-flex items-center gap-4 ml-auto">Login `;
    Github_icon($$payload, {});
    $$payload.out += `<!----></a>`;
  }
  $$payload.out += `<!--]--></div></header> <main class="p-2 md:p-6 space-y-2 md:space-y-6 flex-1 overflow-y-auto overflow-x-hidden">`;
  children($$payload);
  $$payload.out += `<!----></main></div></div>`;
  pop();
}
export {
  _layout as default
};
