<script lang="ts">
  import Chat from '$lib/components/icons/chat.svelte';

  interface Props {
    chat: {
      title: string;
      description: string | null;
      messages: Readonly<{
        chunks: Readonly<{
          content: string;
        }[]>;
      }[]>;
    };
    search: string;
  }

  const {
    chat,
    search,
  }: Props = $props();
</script>

<div class="flex items-center gap-2">
  <div class="flex-shrink-0">
    <Chat />
  </div>
  <div class="overflow-hidden">
    <h4 class="font-medium text-gray-800 truncate">
      {#if chat.title.toLowerCase().includes(search.toLowerCase())}
        {@const parts = chat.title.split(new RegExp(`(${search})`, 'i'))}
        {#each parts as part, i}
          {#if part.toLowerCase() === search.toLowerCase()}
            <span class="bg-yellow-200">{part}</span>
          {:else}
            {part}
          {/if}
        {/each}
      {:else}
        {chat.title}
      {/if}
    </h4>
    {#if chat.messages && chat.messages.length > 0}
      {@const matchingChunk = chat.messages.flatMap(m => m.chunks || []).find(chunk => 
        chunk.content.toLowerCase().includes(search.toLowerCase())
      )}
      {#if matchingChunk}
        {@const parts = matchingChunk.content.split(new RegExp(`(${search})`, 'i'))}
        <p class="text-sm text-gray-500 line-clamp-2">
          {#each parts as part, i}
            {#if part.toLowerCase() === search.toLowerCase()}
              <span class="bg-yellow-200">{part}</span>
            {:else}
              {part}
            {/if}
          {/each}
        </p>
      {:else if chat.description}
        <p class="text-sm text-gray-500 line-clamp-2">{chat.description}</p>
      {/if}
    {:else if chat.description}
      <p class="text-sm text-gray-500 line-clamp-2">{chat.description}</p>
    {/if}
  </div>
</div>
