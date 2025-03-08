<script lang='ts'>
  import { useQuery } from '$lib/zero/query.svelte';
  import { z } from '$lib/zero/z.svelte';

  const {
    submit,
    locked = false,
  }: { submit: (message: string) => void; locked?: boolean } = $props();

  let message = $state('');
  let textarea: HTMLTextAreaElement | null = $state(null);

  const messages = useQuery(() => z.current.query.messages.where('userId', z.current.userID).orderBy('id', 'desc').limit(20));
  const lastMessage = $derived(messages.current.at(-1));
  const reachedMessageLimit = $derived(messages.current.length >= 20 && (lastMessage && lastMessage.createdAt > Date.now() - 1000 * 60 * 60 * 24));

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submitMessage();
    }
  }

  async function submitMessage() {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || locked || reachedMessageLimit)
      return;

    submit(trimmedMessage);
    message = '';
    autoResize();
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
    <div class='text-xs text-gray-500 dark:text-gray-400 self-end w-full hidden md:block space-x-4'>
      <span>Press Enter to send, Shift+Enter for new line</span>
      <span class={message.length >= 10000 ? 'text-red-500' : ''}>{message.length}/10000 characters</span>
      <span class='text-xs {messages.current.length >= 20 ? 'text-red-500' : ''}'>{messages.current.length}/20 daily messages</span>
    </div>
    <button
      onclick={submitMessage}
      disabled={!message.trim() || locked || reachedMessageLimit}
      class='shrink-0 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto'
    >
      {locked ? 'Generating response...' : reachedMessageLimit ? 'Message limit reached' : 'Send'}
    </button>
  </div>
</div>
