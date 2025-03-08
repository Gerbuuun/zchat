<script lang='ts'>
  import { z } from '$lib/zero/z.svelte';
  import { MessageSquareTextIcon, MessagesSquareIcon } from 'lucide-svelte';

  interface Props {
    chat: {
      title: string;
      description: string | null;
      userId: string;
      messages: Readonly<{
        content: string;
      }[]>;
    };
    search: string;
  }

  const {
    chat,
    search,
  }: Props = $props();
</script>

<div class='flex items-start gap-2'>
  <div class='flex-shrink-0 py-1.5 text-gray-500 dark:text-gray-400'>
    {#if chat.userId === z.current.userID}
      <MessageSquareTextIcon size={20} />
    {:else}
      <MessagesSquareIcon size={20} />
    {/if}
  </div>
  <div class='overflow-hidden'>
    <h4 class='font-medium text-gray-800 dark:text-gray-300 truncate'>
      {#if chat.title.toLowerCase().includes(search.toLowerCase())}
        {@const parts = chat.title.split(new RegExp(`(${search})`, 'i'))}
        {#each parts as part}
          {#if part.toLowerCase() === search.toLowerCase()}
            <span class='bg-yellow-200 dark:bg-yellow-400 dark:text-gray-900'>{part}</span>
          {:else}
            {part}
          {/if}
        {/each}
      {:else}
        {chat.title}
      {/if}
    </h4>
    {#if chat.messages && chat.messages.length > 0}
      {@const matchingMessage = chat.messages.find(msg => msg.content.toLowerCase().includes(search.toLowerCase()))}
      {#if matchingMessage}
        {@const parts = matchingMessage.content.split(new RegExp(`(${search})`, 'i'))}
        <p class='text-sm text-gray-500 dark:text-gray-400 line-clamp-2'>
          {#each parts as part}
            {#if part.toLowerCase() === search.toLowerCase()}
              <span class='bg-yellow-200 dark:bg-yellow-400 dark:text-gray-900'>{part}</span>
            {:else}
              {part}
            {/if}
          {/each}
        </p>
      {:else if chat.description}
        <p class='text-sm text-gray-500 dark:text-gray-400 line-clamp-2'>{chat.description}</p>
      {/if}
    {:else if chat.description}
      <p class='text-sm text-gray-500 dark:text-gray-400 line-clamp-2'>{chat.description}</p>
    {/if}
  </div>
</div>
