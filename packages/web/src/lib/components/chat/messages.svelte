<script lang='ts'>
  import type { Message } from '$lib/zero/schema';
  import Markdown from '$lib/components/markdown.svelte';

  import { useQuery } from '$lib/zero/query.svelte';

  import { z } from '$lib/zero/z.svelte';
  import { fade, fly } from 'svelte/transition';

  const {
    chatId,
    animate = false,
  }: {
    chatId: string;
    animate?: boolean;
  } = $props();

  const messages = useQuery(() =>
    z.current.query.messages
      .where('chatId', chatId)
      .related('chunks')
      .related('user'),
  );

  let chatContainer = $state<HTMLDivElement | null>(null);

  // function scrollToLastMessage() {
  //   if (!chatContainer) return;
    
  //   // Calculate the position that puts the last message at the top
  //   const lastMessage = chatContainer.lastElementChild;
  //   if (!lastMessage) return;
    
  //   const lastMessageHeight = lastMessage.clientHeight;
  //   const scrollPosition = chatContainer.scrollHeight - lastMessageHeight - 24;
    
  //   chatContainer.scrollTo({
  //     top: Math.max(0, scrollPosition),
  //     behavior: animate ? 'smooth' : 'instant',
  //   });
  // }

  $effect(() => {
    if (messages.current.length) {
      chatContainer?.scrollTo({
        top: chatContainer.scrollHeight,
        behavior: animate ? 'smooth' : 'instant',
      });
    }
  });

  function messageClass(message: Message) {
    if (message.userId === z.current.userID)
      return 'bg-blue-500 text-white ml-auto self-end';
    if (message.role === 'assistant')
      return 'bg-orange-500 text-white mr-auto self-start';
    return 'bg-gray-200 text-gray-800 mr-auto self-start';
  }
</script>

<div class='flex-1 overflow-y-scroll space-y-2 md:space-y-4 bg-white rounded-lg shadow-md p-2 md:p-4' bind:this={chatContainer}>
  {#each messages.current as message (message.id)}
    {@const isUser = message.userId === z.current.userID}
    <div
      class='rounded-lg p-3 md:p-4 shadow-md transition-all duration-300 overflow-hidden {messageClass(message)} max-w-[80%]'
      in:fly={{ duration: animate ? 100 : 0 }}
    >
      <p class='flex font-bold capitalize mb-2 md:mb-4 items-center justify-between border-b {message.role === 'user' && !isUser ? 'border-gray-500' : 'border-white'} pb-2 gap-2'>
        <span class='truncate'>{message.role === 'user' ? message.user?.name : 'Assistant'}</span>
        <span class='flex-shrink-0 text-xs'>
          {new Date(message.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
        </span>
      </p>

      <div class='overflow-x-scroll'>
        <Markdown content={message.chunks.map(chunk => chunk.content).join('')} />
      </div>
    </div>
  {/each}

  {#if !messages.current.length}
    <div class='flex items-center justify-center h-full text-center text-gray-500' in:fade={{ duration: 100 }}>
      <p>Send a message to get started</p>
    </div>
  {/if}
</div>
