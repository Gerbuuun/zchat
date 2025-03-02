<script lang='ts'>
  import { useQuery } from '$lib/zero/query.svelte';
  import { z } from '$lib/zero/z.svelte';
  import { micromark } from 'micromark';
  import { gfm } from 'micromark-extension-gfm';
  import { gfmTable, gfmTableHtml } from 'micromark-extension-gfm-table';
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';

  const {
    chatId,
    enableAnimations = false,
  }: { chatId: string; enableAnimations?: boolean } = $props();

  const messages = useQuery(() =>
    z.current.query.messages
      .where('chatId', chatId)
      .related('chunks')
      .related('user'),
  );

  let chatContainer = $state<HTMLDivElement | null>(null);
  const flyConfig = (i: number) => ({
    duration: enableAnimations ? 100 : 0,
    delay: i * 10,
  });

  function scrollToBottom() {
    if (chatContainer) {
      chatContainer.scrollTo({
        top: chatContainer.scrollHeight,
        behavior: 'smooth',
      });
    }
  }

  $effect(() => {
    if (messages.current.length) {
      setTimeout(() => {
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 10);
    }
  });

  onMount(scrollToBottom);
</script>

<div class='flex-1 overflow-y-scroll space-y-2 md:space-y-4 bg-white rounded-lg shadow-md p-4' bind:this={chatContainer}>
  {#each messages.current as message, i (message.id)}
    {@const isUser = message.userId === z.current.userID}
    {@const isAssistant = message.role === 'assistant'}
    <div
      class="rounded-lg p-4 shadow-md transition-all duration-300 overflow-hidden {isUser
        ? 'bg-blue-500 text-white ml-auto self-end'
        : isAssistant
        ? 'bg-orange-500 text-white mr-auto self-start'
        : 'bg-gray-200 text-gray-800 mr-auto self-start'} max-w-[80%]"
      in:fly={flyConfig(i)}
    >
      <p class='flex font-bold capitalize mb-4 items-center justify-between border-b {message.role === 'user' && !isUser ? 'border-gray-500' : 'border-white'} pb-2'>
        <span>{message.role === 'user' ? message.user?.name : 'Assistant'}</span>
        <span class='text-xs'>
          {new Date(message.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
        </span>
      </p>
      <div class='markdown-content overflow-x-scroll'>
        {@html micromark(message.chunks.map(chunk => chunk.content).join(''), {
          extensions: [gfm(), gfmTable()],
          htmlExtensions: [gfmTableHtml()],
        })}
      </div>
    </div>
  {/each}
  {#if !messages.current.length}
    <div class='flex items-center justify-center h-full text-center text-gray-500' in:fade={{ duration: 100 }}>
      <p>Send a message to get started</p>
    </div>
  {/if}
</div>

<style>
  /* Styling for parsed markdown content */
  :global(.markdown-content h1) {
    font-size: 1.5rem;
    font-weight: 700;
    margin-top: 1.5rem;
    margin-bottom: 1rem;
  }

  :global(.markdown-content h2) {
    font-size: 1.25rem;
    font-weight: 600;
    margin-top: 1.25rem;
    margin-bottom: 0.75rem;
  }

  :global(.markdown-content h3) {
    font-size: 1.125rem;
    font-weight: 600;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
  }

  :global(.markdown-content p) {
    margin-bottom: 0.75rem;
    line-height: 1.6;
  }

  :global(.markdown-content ul),
  :global(.markdown-content ol) {
    margin-left: 1.5rem;
    margin-bottom: 0.75rem;
  }

  :global(.markdown-content ul) {
    list-style-type: disc;
  }

  :global(.markdown-content ol) {
    list-style-type: decimal;
  }

  :global(.markdown-content li) {
    margin-bottom: 0.25rem;
  }

  :global(.markdown-content a) {
    text-decoration: underline;
  }

  :global(.markdown-content code) {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.875em;
    background-color: #0002;
    padding: 0.2em 0.4em;
    border-radius: 0.25rem;
  }

  :global(.markdown-content pre) {
    background-color: #0002;
    padding: 1rem;
    border-radius: 0.375rem;
    overflow-x: auto;
    margin-bottom: 1rem;
  }

  :global(.markdown-content blockquote) {
    border-left: 4px solid #e5e7eb;
    padding-left: 1rem;
    font-style: italic;
    margin-bottom: 1rem;
  }

  :global(.markdown-content hr) {
    border: 0;
    border-top: 1px solid #e5e7eb;
    margin: 1.5rem 0;
  }

  :global(.markdown-content table) {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
  }

  :global(.markdown-content th),
  :global(.markdown-content td) {
    border: 1px solid #e5e7eb;
    padding: 0.5rem;
    text-align: left;
  }

  :global(.markdown-content th) {
    font-weight: 600;
  }
</style>
