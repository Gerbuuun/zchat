<script lang='ts'>
  import { page } from '$app/state';
  import Card from '$lib/components/card.svelte';
  import ChatInput from '$lib/components/chat/input.svelte';
  import ChatMessages from '$lib/components/chat/messages.svelte';
  import ChatShare from '$lib/components/chat/share.svelte';
  import { showToast } from '$lib/toaster';

  import { useQuery } from '$lib/zero/query.svelte';
  import { z } from '$lib/zero/z.svelte';
  import { ulid } from 'ulid';

  const chatId = $derived(page.params.chatId);
  let chatContainer = $state<HTMLDivElement | null>(null);

  const chat = useQuery(() => z.current.query.chats
    .where('id', chatId)
    .related('chatAccess', q => q.related('user'))
    .one(),
  );
  const messages = useQuery(() => z.current.query.messages.where('chatId', chatId));

  $effect(() => {
    if (messages.current) {
      chatContainer?.scrollTo({
        top: chatContainer.scrollHeight,
        behavior: 'instant',
      });
    }
  });

  async function handleSubmit(message: string) {
    try {
      await z.current.mutateBatch(async (tx) => {
        if (!chat.current) {
          await tx.chats.insert({
            id: chatId,
            title: 'New Chat',
            userId: z.current.userID,
            public: false,
            locked: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }

        await tx.messages.insert({
          id: ulid(),
          chatId,
          role: 'user',
          content: message,
          createdAt: Date.now(),
          userId: z.current.userID,
        });
      });

      // Lock the chat to prevent other users from writing to it while we're generating the response
      z.current.mutate.chats.update({
        id: chatId,
        locked: true,
      });
    }
    catch (error) {
      console.error(error);
      showToast('Something went wrong while sending the message');
    }
  }

  const isLoggedIn = $derived(z.current.userID !== 'anon');
  const isNewChat = $derived(chat.current === undefined);
  const canWrite = $derived(chat.current?.chatAccess.some(access => access.userId === z.current.userID) || z.current.userID === chat.current?.userId);
</script>

<svelte:head>
  <title>ZChat - {chat.current?.title ?? 'New Chat'}</title>
</svelte:head>

<div class='overflow-y-auto h-full p-2 md:p-6' bind:this={chatContainer}>
  <div class='flex flex-col gap-y-2 md:gap-y-6 max-w-7xl mx-auto min-h-full'>
    <Card class='sticky top-0 w-full'>
      <div class='flex items-center justify-between'>
        {#key chat.current?.title}
          <h2 class='text-xl md:text-2xl font-bold truncate'>
            {chat.current?.title ?? 'New Chat'}
          </h2>
        {/key}

        <div class='flex items-center gap-2'>
          <div class='hidden md:flex -space-x-2 overflow-hidden'>
            {#each chat.current?.chatAccess ?? [] as share}
              {#if share.user}
                <div class='inline-block size-8 rounded-full ring-2 ring-white dark:ring-gray-700 overflow-hidden'>
                  <img
                    src={`https://github.com/${share.user.username}.png`}
                    alt={share.user.name || 'User'}
                    class='h-full w-full object-cover'
                  />
                </div>
              {/if}
            {/each}
          </div>

          {#if isLoggedIn && !isNewChat}
            <ChatShare {chatId} />
          {/if}
        </div>
      </div>
    </Card>

    <ChatMessages {chatId} />

    <Card class='sticky bottom-0 w-full'>
      {#if isLoggedIn}
        {#if canWrite || isNewChat}
          <ChatInput submit={handleSubmit} locked={chat.current?.locked} />
        {:else}
          <h2>You don't have write access to this chat</h2>
        {/if}
      {:else}
        <h2>You must be logged in to chat</h2>
      {/if}
    </Card>
  </div>
</div>
