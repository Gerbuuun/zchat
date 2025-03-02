<script lang='ts'>
  import { goto } from '$app/navigation';
  import Card from '$lib/components/card.svelte';
  import Plus from '$lib/components/icons/plus.svelte';
  import { ulid } from 'ulid';

  function createNewChat() {
    goto(`/${ulid()}`);
  }
</script>

<Card>
  <div class='flex flex-col items-center justify-center p-2 md:p-6 space-y-8 h-full'>
    <h1 class='text-3xl font-bold text-gray-800'>Welcome to ZChat!</h1>

    <p class='text-gray-600 text-center max-w-md'>
      Start a new conversation or use keyboard shortcuts to navigate quickly.
    </p>

    <button
      class='bg-[#FF3E00] hover:bg-[#E03600] text-white font-medium py-2 px-6 rounded-lg flex items-center gap-2 transition-colors'
      onclick={createNewChat}
    >
      <Plus />
      Create New Chat
    </button>

    <div class='w-full max-w-md flex items-center'>
      <div class='flex-grow h-px bg-gray-300'></div>
      <span class='px-4 text-gray-500 text-sm'>or</span>
      <div class='flex-grow h-px bg-gray-300'></div>
    </div>

    <p class='text-gray-600 text-center max-w-md'>
      Use Cmd/Ctrl + K to search and use shortcuts.
    </p>

    <div class='w-full max-w-md'>
      <!-- Desktop: Keyboard Shortcuts -->
      <h2 class='text-lg font-semibold text-gray-700 mb-3'>Features</h2>
      <ul class='bg-gray-50 rounded-lg p-4 space-y-2 text-gray-600 list-disc list-inside'>
        <li>Local cache using Zero</li>
        <li>Instantly search your chat history</li>
        <li>Multi-user chats</li>
        <li>Read and write access control</li>
      </ul>
    </div>
  </div>
</Card>
