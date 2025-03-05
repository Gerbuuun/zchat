<script lang='ts'>
  import type { Message } from '$lib/zero/schema';
  import Markdown from '$lib/components/markdown.svelte';

  import { useQuery } from '$lib/zero/query.svelte';

  import { z } from '$lib/zero/z.svelte';
  import { fly } from 'svelte/transition';

  const { chatId, animate }: { chatId: string; animate: boolean } = $props();

  const messages = useQuery(() => z.current.query.messages.where('chatId', chatId).related('user'));

  function messageClass(message: Message) {
    if (message.userId === z.current.userID)
      return 'bg-blue-500/30 ml-auto self-end';
    if (message.role === 'assistant')
      return 'bg-orange-500/30 mr-auto self-start';
    return 'bg-white text-gray-700 mr-auto self-start';
  }
</script>

<div class='flex flex-col p-2 gap-y-2 md:gap-y-6 flex-1'>
  {#each messages.current as message (message.id)}
    <div
      class='rounded-lg p-3 md:p-4 shadow-md transition-all duration-300 overflow-hidden {messageClass(message)} max-w-[95%] md:max-w-[80%] w-full'
      in:fly={{ duration: animate ? 100 : 0 }}
    >
      <p class='flex font-bold capitalize mb-2 md:mb-4 items-center justify-between border-b border-gray-700 pb-2 gap-2'>
        <span class='inline-flex gap-2 items-center'>
          <img
            src={message.user ? `https://github.com/${message.user.username}.png` : '/favicon.png'}
            alt={message.user?.name}
            class='flex-shrink-0 size-5 rounded-full'
          />
          <span class='truncate'>{message.role === 'user' ? message.user?.name : 'Assistant'}</span>
        </span>
        <span class='flex-shrink-0 text-xs text-gray-700'>
          {new Date(message.createdAt).toLocaleTimeString(undefined, { timeStyle: 'short' })}
        </span>
      </p>

      <div class='prose prose-sm md:prose-base marker:text-gray-700 overflow-x-scroll max-w-full'>
        <Markdown content={message.content} />
      </div>
    </div>
  {/each}

  {#if !messages.current.length}
    <p class='text-center text-gray-500 my-auto'>Send a message to get started</p>
  {/if}
</div>
