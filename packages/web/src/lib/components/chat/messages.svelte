<script lang='ts'>
  import type { Message } from '$lib/zero/schema';
  import Markdown from '$lib/components/markdown.svelte';
  import { useQuery } from '$lib/zero/query.svelte';
  import { z } from '$lib/zero/z.svelte';

  const { chatId }: { chatId: string } = $props();

  const messages = useQuery(() => z.current.query.messages.where('chatId', chatId).related('user'));

  function messageClass(message: Message) {
    if (message.userId === z.current.userID)
      return 'bg-blue-500/30 dark:bg-blue-800 ml-auto self-end';
    if (message.role === 'assistant')
      return 'bg-orange-500/30 dark:bg-orange-800 mr-auto self-start';
    return 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 mr-auto self-start';
  }
</script>

<div class='flex flex-col p-2 gap-y-2 md:gap-y-6 flex-1'>
  {#each messages.current as message (message.id)}
    <div class='rounded-lg p-3 md:p-4 shadow-md overflow-hidden {messageClass(message)} max-w-[95%] md:max-w-[80%] w-full'>
      <p class='flex font-bold capitalize mb-2 md:mb-4 items-center justify-between border-b border-gray-700 dark:border-gray-300 pb-2 gap-2'>
        <span class='inline-flex gap-2 items-center'>
          <img
            src={message.user ? `https://github.com/${message.user.username}.png` : '/favicon.png'}
            alt={message.user?.name}
            class='flex-shrink-0 size-5 rounded-full'
          />
          <span class='truncate dark:text-gray-300'>{message.role === 'user' ? message.user?.name : 'Assistant'}</span>
        </span>
        <span class='flex-shrink-0 text-xs text-gray-700 dark:text-gray-300'>
          {new Date(message.createdAt).toLocaleTimeString(undefined, { timeStyle: 'short' })}
        </span>
      </p>

      <div class='prose dark:prose-invert prose-sm md:prose-base marker:text-gray-700 dark:marker:text-gray-300 prose-hr:border-gray-700 dark:prose-hr:border-gray-300 overflow-x-scroll max-w-full'>
        <Markdown content={message.content} />
      </div>
    </div>
  {/each}

  {#if !messages.current.length}
    <p class='text-center text-gray-500 my-auto'>Send a message to get started</p>
  {/if}
</div>
