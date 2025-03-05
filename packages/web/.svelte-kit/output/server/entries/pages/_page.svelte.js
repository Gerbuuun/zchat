import { l as pop, p as push } from "../../chunks/index.js";
import "../../chunks/client.js";
import "ulid";
import { C as Card } from "../../chunks/card.js";
import { P as Plus, G as Github_icon } from "../../chunks/plus.js";
function _page($$payload, $$props) {
  push();
  const loggedIn = !!document.cookie.split("; ").find((row) => row.startsWith("auth="))?.split("=")[1];
  Card($$payload, {
    children: ($$payload2) => {
      $$payload2.out += `<div class="flex flex-col items-center justify-center p-2 md:p-6 space-y-8 h-full"><h1 class="text-3xl font-bold text-gray-800">Welcome to ZChat!</h1> <div class="w-full max-w-lg"><h2 class="text-lg font-semibold text-gray-700 mb-3">About the project</h2> <ul class="bg-gray-50 rounded-lg p-4 space-y-2 text-gray-600 list-disc list-inside"><li>Svelte frontend deployed on AWS S3</li> <li>Zero sync server running on ECS with RDS as database</li> <li>Lambda function to generate LLM responses and handle auth</li> <li>Lambda is invoked by RDS on user message insert</li> <li><b>All</b> data communication is handled through Zero</li> <li>Cloudflare DNS and proxy</li> <li>Fully deployed via SST, only need to run migrations</li></ul></div> <div class="w-full max-w-lg"><h2 class="text-lg font-semibold text-gray-700 mb-3">About the developer</h2> <ul class="bg-gray-50 rounded-lg p-4 space-y-2 text-gray-600 list-disc list-inside"><li>24 years old, from the Netherlands</li> <li>Recently graduated university as an Electrical Engineer</li> <li>Programming too much in his free time</li> <li>Looking for a job!</li> <li><a href="mailto:gerbuuun@pm.me" class="text-blue-500 underline" target="_blank">Email</a>, <a href="https://x.com/gerbuuun" class="text-blue-500 underline" target="_blank">X/Twitter</a>, <a href="https://bsky.app/profile/grbn.dev" class="text-blue-500 underline" target="_blank">BlueSky</a>, <a href="https://github.com/gerbuuun" class="text-blue-500 underline" target="_blank">GitHub</a></li></ul></div> `;
      if (loggedIn) {
        $$payload2.out += "<!--[-->";
        $$payload2.out += `<button class="bg-[#FF3E00] hover:bg-[#E03600] text-white font-medium py-2 px-6 rounded-lg flex items-center gap-2 transition-colors">`;
        Plus($$payload2, {});
        $$payload2.out += `<!----> Create New Chat</button> <div class="w-full max-w-md flex items-center"><div class="flex-grow h-px bg-gray-300"></div> <span class="px-4 text-gray-500 text-sm">or</span> <div class="flex-grow h-px bg-gray-300"></div></div> <p class="text-gray-600 text-center max-w-md">Use Cmd/Ctrl + K to search and use shortcuts.</p>`;
      } else {
        $$payload2.out += "<!--[!-->";
        $$payload2.out += `<a href="/api/auth" class="bg-[#FF3E00] hover:bg-[#E03600] text-white font-medium py-2 px-6 rounded-lg flex items-center gap-2 transition-colors">Login with GitHub `;
        Github_icon($$payload2, {});
        $$payload2.out += `<!----></a>`;
      }
      $$payload2.out += `<!--]--> <div class="w-full max-w-md"><h2 class="text-lg font-semibold text-gray-700 mb-3">Features</h2> <ul class="bg-gray-50 rounded-lg p-4 space-y-2 text-gray-600 list-disc list-inside"><li>Instantly search your chat history</li> <li>Multi-user chats</li> <li>Read and write access control</li></ul></div></div>`;
    }
  });
  pop();
}
export {
  _page as default
};
