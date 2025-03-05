import { m as sanitize_props, n as spread_props, o as slot, t as escape_html, u as attr, l as pop, p as push, q as ensure_array_like, v as stringify, w as head } from "../../../chunks/index.js";
import { p as page } from "../../../chunks/index2.js";
import { C as Card } from "../../../chunks/card.js";
import { micromark } from "micromark";
import { gfm } from "micromark-extension-gfm";
import { gfmTableHtml, gfmTable } from "micromark-extension-gfm-table";
import { u as useQuery, z, S as Share_2, X } from "../../../chunks/query.svelte.js";
import "ulid";
import { I as Icon } from "../../../chunks/Icon.js";
function html(value) {
  var html2 = String(value ?? "");
  var open = "<!---->";
  return open + html2 + "<!---->";
}
function Copy($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "rect",
      {
        "width": "14",
        "height": "14",
        "x": "8",
        "y": "8",
        "rx": "2",
        "ry": "2"
      }
    ],
    [
      "path",
      {
        "d": "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
      }
    ]
  ];
  Icon($$payload, spread_props([
    { name: "copy" },
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
function Input($$payload, $$props) {
  push();
  const { locked = false } = $$props;
  let message = "";
  $$payload.out += `<div class="bg-white rounded-lg shadow p-2 md:p-4"><div class="flex flex-col"><textarea placeholder="Type your message here..." class="w-full resize-none overflow-scroll focus:outline-none min-h-[60px] max-h-[200px]" rows="1" autofocus>`;
  const $$body = escape_html(message);
  if ($$body) {
    $$payload.out += `${$$body}`;
  }
  $$payload.out += `</textarea> <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 gap-2 sm:gap-0"><div class="text-xs text-gray-500 order-2 self-end sm:order-1 w-full sm:w-auto hidden md:block">Press Enter to send, Shift+Enter for new line</div> <button${attr("disabled", !message.trim() || locked, true)} class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2 w-full sm:w-auto">${escape_html(locked ? "Generating response..." : "Send")}</button></div></div></div>`;
  pop();
}
function Markdown($$payload, $$props) {
  push();
  const { content } = $$props;
  $$payload.out += `<div class="markdown-content">${html(micromark(content, {
    extensions: [gfm(), gfmTable()],
    htmlExtensions: [gfmTableHtml()]
  }))}</div>`;
  pop();
}
function Messages($$payload, $$props) {
  push();
  const { chatId } = $$props;
  const messages = useQuery(() => z.current.query.messages.where("chatId", chatId).related("chunks").related("user"));
  function messageClass(message) {
    if (message.userId === z.current.userID) return "bg-blue-500 text-white ml-auto self-end";
    if (message.role === "assistant") return "bg-orange-500 text-white mr-auto self-start";
    return "bg-gray-200 text-gray-800 mr-auto self-start";
  }
  const each_array = ensure_array_like(messages.current);
  $$payload.out += `<div class="flex-1 overflow-y-scroll space-y-2 md:space-y-4 bg-white rounded-lg shadow-md p-2 md:p-4"><!--[-->`;
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let message = each_array[$$index];
    const isUser = message.userId === z.current.userID;
    $$payload.out += `<div${attr("class", `rounded-lg p-3 md:p-4 shadow-md transition-all duration-300 overflow-hidden ${stringify(messageClass(message))} max-w-[80%]`)}><p${attr("class", `flex font-bold capitalize mb-2 md:mb-4 items-center justify-between border-b ${stringify(message.role === "user" && !isUser ? "border-gray-500" : "border-white")} pb-2 gap-2`)}><span class="truncate">${escape_html(message.role === "user" ? message.user?.name : "Assistant")}</span> <span class="flex-shrink-0 text-xs">${escape_html(new Date(message.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" }))}</span></p> <div class="overflow-x-scroll">`;
    Markdown($$payload, {
      content: message.chunks.map((chunk) => chunk.content).join("")
    });
    $$payload.out += `<!----></div></div>`;
  }
  $$payload.out += `<!--]--> `;
  if (!messages.current.length) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="flex items-center justify-center h-full text-center text-gray-500"><p>Send a message to get started</p></div>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--></div>`;
  pop();
}
function toggle($$payload, labels, checked, onchange) {
  $$payload.out += `<label class="inline-flex items-center cursor-pointer"><span class="text-sm font-medium text-gray-700">${escape_html(labels[checked ? 0 : 1])}</span> <input type="checkbox" class="sr-only peer"${attr("checked", checked, true)}> <div class="mx-2 relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-[#FF3E00] peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF3E00]"></div></label>`;
}
function Share($$payload, $$props) {
  push();
  const { chatId } = $$props;
  const chat = useQuery(() => z.current.query.chats.where("id", chatId).one());
  const shares = useQuery(() => z.current.query.chat_access.where("chatId", chatId).related("user"));
  let githubUsername = "";
  $$payload.out += `<button class="ml-2 p-2 rounded-md flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" aria-label="Share chat">`;
  Share_2($$payload, { size: 20 });
  $$payload.out += `<!----> <span class="hidden md:block">Share</span></button> <dialog class="max-h-full rounded-lg shadow-lg w-full max-w-xl p-4 md:mx-auto md:mt-[20vh] inset-0 m-0 h-full md:h-fit"><div class="flex justify-between items-center mb-4"><h2 class="text-xl font-bold">Share Chat</h2> <button class="text-gray-500 hover:text-gray-700" aria-label="Close">`;
  X($$payload, {});
  $$payload.out += `<!----></button></div> <div class="mb-4"><label for="githubUsername" class="block text-sm font-medium text-gray-700 mb-1">Add user by github username</label> <div class="flex"><input id="githubUsername" type="text"${attr("value", githubUsername)} placeholder="username" class="flex-1 rounded-l-md border border-gray-300 px-3 py-2 focus:border-[#FF3E00] focus:ring-[#FF3E00] focus:outline-none"> <button class="bg-[#FF3E00] text-white px-4 py-2 rounded-r-md hover:bg-[#FF5722] focus:outline-none focus:ring-2 focus:ring-[#FF3E00] focus:ring-offset-2">Add</button></div></div> <div class="mb-6"><h3 class="text-sm font-medium text-gray-700 mb-2">Currently shared with</h3> `;
  if (shares.current.length === 0) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<p class="text-sm text-gray-500 italic">No users have been added yet</p>`;
  } else {
    $$payload.out += "<!--[!-->";
    const each_array = ensure_array_like(shares.current);
    $$payload.out += `<ul class="divide-y divide-gray-200"><!--[-->`;
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let share = each_array[$$index];
      if (share.user) {
        $$payload.out += "<!--[-->";
        $$payload.out += `<li class="py-3 flex items-center justify-between"><div class="flex items-center"><div class="size-8 rounded-full overflow-hidden bg-gray-200 mr-3"><img${attr("src", `https://github.com/${share.user.username}.png`)}${attr("alt", share.user.name || "User")} class="h-full w-full object-cover"></div> <div><p class="font-medium">${escape_html(share.user.name || "Unknown User")}</p> <p class="text-sm text-gray-500">${escape_html(share.user.username || "")}</p></div></div> <div class="flex items-center gap-2">`;
        toggle($$payload, ["Write", "Read"], share.write);
        $$payload.out += `<!----> <button class="p-1 rounded text-red-500 hover:bg-red-50" aria-label="Remove user">`;
        X($$payload, { size: 20 });
        $$payload.out += `<!----></button></div></li>`;
      } else {
        $$payload.out += "<!--[!-->";
      }
      $$payload.out += `<!--]-->`;
    }
    $$payload.out += `<!--]--></ul>`;
  }
  $$payload.out += `<!--]--></div> <div class="flex items-center mb-3"><p class="text-sm font-medium text-gray-700 mr-auto">Public Access</p> <div class="flex items-center gap-2">`;
  toggle($$payload, ["Public", "Private"], chat.current?.public);
  $$payload.out += `<!----> <button class="p-1 rounded text-gray-500 hover:bg-gray-50" aria-label="Copy link">`;
  Copy($$payload, { size: 20 });
  $$payload.out += `<!----></button></div></div></dialog>`;
  pop();
}
function _page($$payload, $$props) {
  push();
  const chatId = page.params.chatId;
  const chat = useQuery(() => z.current.query.chats.where("id", chatId).related("chatAccess", (q) => q.related("user")).one());
  const isLoggedIn = z.current.userID !== "anon";
  const isNewChat = chat.current === void 0;
  const canWrite = chat.current?.chatAccess.some((access) => access.userId === z.current.userID) || z.current.userID === chat.current?.userId;
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>ZChat - ${escape_html(chat.current?.title ?? "New Chat")}</title>`;
  });
  $$payload.out += `<div class="flex flex-col h-[calc(100dvh-88px)] md:h-[calc(100dvh-112px)] space-y-2 md:space-y-6">`;
  Card($$payload, {
    children: ($$payload2) => {
      const each_array = ensure_array_like(chat.current?.chatAccess ?? []);
      $$payload2.out += `<div class="flex items-center justify-between"><!---->`;
      {
        $$payload2.out += `<h2 class="text-xl md:text-2xl font-bold truncate">${escape_html(chat.current?.title ?? "New Chat")}</h2>`;
      }
      $$payload2.out += `<!----> <div class="flex items-center gap-2"><div class="hidden md:flex -space-x-2 overflow-hidden"><!--[-->`;
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let share = each_array[$$index];
        if (share.user) {
          $$payload2.out += "<!--[-->";
          $$payload2.out += `<div class="inline-block size-8 rounded-full ring-2 ring-white overflow-hidden bg-gray-200"><img${attr("src", `https://github.com/${share.user.username}.png`)}${attr("alt", share.user.name || "User")} class="h-full w-full object-cover"></div>`;
        } else {
          $$payload2.out += "<!--[!-->";
        }
        $$payload2.out += `<!--]-->`;
      }
      $$payload2.out += `<!--]--></div> `;
      Share($$payload2, { chatId });
      $$payload2.out += `<!----></div></div>`;
    }
  });
  $$payload.out += `<!----> `;
  Messages($$payload, { chatId });
  $$payload.out += `<!----> `;
  if (isLoggedIn) {
    $$payload.out += "<!--[-->";
    if (canWrite || isNewChat) {
      $$payload.out += "<!--[-->";
      Input($$payload, {
        locked: chat.current?.locked
      });
    } else {
      $$payload.out += "<!--[!-->";
      Card($$payload, {
        children: ($$payload2) => {
          $$payload2.out += `<h2>You don't have write access to this chat</h2>`;
        }
      });
    }
    $$payload.out += `<!--]-->`;
  } else {
    $$payload.out += "<!--[!-->";
    Card($$payload, {
      children: ($$payload2) => {
        $$payload2.out += `<h2>You must be logged in to chat</h2>`;
      }
    });
  }
  $$payload.out += `<!--]--></div>`;
  pop();
}
export {
  _page as default
};
