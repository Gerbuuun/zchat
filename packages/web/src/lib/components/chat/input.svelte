<script lang='ts'>
  import { onDestroy } from 'svelte';
  import { useQuery } from '$lib/zero/query.svelte';
  import { z } from '$lib/zero/z.svelte';

  const {
    submit,
    locked = false,
  }: { submit: (message: string) => void; locked?: boolean } = $props();

  let message = $state('');
  let textarea: HTMLTextAreaElement | null = $state(null);
  let reachedMessageLimit = $state(false);

  const messages = useQuery(() => z.current.query.messages.where('userId', z.current.userID).limit(20));

  const interval = setInterval(() => {
    reachedMessageLimit = messages.current.filter(m => m.createdAt > Date.now() - 1000 * 60 * 60 * 24).length === 20;
  }, 1000);

  onDestroy(() => clearInterval(interval));

  function handleKeydown(event: KeyboardEvent) {
    // Submit on Enter (without Shift)
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submitMessage();
    }
  }

  async function submitMessage() {
    if (!message.trim() || locked || reachedMessageLimit)
      return;

    submit(message.trim());
    message = '';

    // Reset textarea height
    if (textarea) {
      textarea.style.height = 'auto';
    }
  }

  function autoResize() {
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }
</script>

<div class='flex flex-col'>
  <!-- svelte-ignore a11y_autofocus -->
  <textarea
    bind:this={textarea}
    bind:value={message}
    oninput={autoResize}
    onkeydown={handleKeydown}
    placeholder='Type your message here...'
    class='w-full resize-none overflow-scroll focus:outline-none min-h-[60px] max-h-[200px]'
    rows='1'
    autofocus
    maxlength='10000'
  ></textarea>

  <div class='flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 gap-2 sm:gap-0'>
    <div class='text-xs text-gray-500 order-2 self-end sm:order-1 w-full sm:w-auto hidden md:block'>
      Press Enter to send, Shift+Enter for new line
      <span class='ml-2 {message.length > 10000 ? 'text-red-500' : ''}'>{message.length}/10000</span>
    </div>
    <button
      onclick={submitMessage}
      disabled={!message.trim() || locked || reachedMessageLimit}
      class='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2 w-full sm:w-auto'
    >
      {locked ? 'Generating response...' : reachedMessageLimit ? 'Message limit reached' : 'Send'}
    </button>
  </div>
</div>
