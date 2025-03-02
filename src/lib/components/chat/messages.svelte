<script lang='ts'>
  import { useQuery } from '$lib/zero/query.svelte';
  import { z } from '$lib/zero/z.svelte';
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
      <p class='flex font-bold capitalize mb-4 items-center justify-between border-b {message.role === 'user' ? 'border-gray-500' : 'border-white'} pb-2'>
        <span>{message.role === 'user' ? message.user?.name : 'Assistant'}</span>
        <span class='text-xs'>
          {new Date(message.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
        </span>
      </p>
      {#each message.chunks as chunk (chunk.index)}
        <p in:fly={flyConfig(i + 1)}>
          {chunk.content}
        </p>
      {/each}
    </div>
  {/each}
  {#if !messages.current.length}
    <div class='flex items-center justify-center h-full text-center text-gray-500' in:fade={{ duration: 100 }}>
      <p>Send a message to get started</p>
    </div>
  {/if}
</div>
