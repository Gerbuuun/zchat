<script lang='ts'>
  import Card from '$lib/components/card.svelte';
  import ChatInput from '$lib/components/chat/input.svelte';
  import ChatMessages from '$lib/components/chat/messages.svelte';
  import ChatUsers from '$lib/components/chat/share.svelte';
  import { showToast } from '$lib/toaster';

  import { useQuery } from '$lib/zero/query.svelte';
  import { z } from '$lib/zero/z.svelte';
  import { fade } from 'svelte/transition';
  import { ulid } from 'ulid';

  const { chatId }: { chatId: string } = $props();

  const chat = useQuery(() => z.current.query.chats.where('id', chatId).related('chatAccess').one());

  let enableAnimations = $state(false);

  function handleSubmit(message: string) {
    try {
      if (!chat.current) {
        z.current.mutate.chats.insert({
          id: chatId,
          title: 'New Chat',
          userId: z.current.userID,
          public: false,
          locked: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }

      // Create the message and message chunk in a single transaction
      const messageId = ulid();
      z.current.mutateBatch((tx) => {
        tx.messages.insert({
          id: messageId,
          chatId,
          role: 'user',
          createdAt: Date.now(),
          userId: z.current.userID,
        });
        tx.message_chunks.insert({
          messageId,
          index: 0,
          content: message,
        });
      });

      // Lock the chat to prevent other users from writing to it while we're generating the response
      z.current.mutate.chats.update({
        id: chatId,
        locked: true,
      });

      enableAnimations = true;
      // Trigger the api to start generating the response
      fetch(`/api/chat/${chatId}`);
    }
    catch (error) {
      console.error(error);
      showToast('Something went wrong while sending the message');
    }
  }

  const fadeIn = { delay: 50, duration: 50 };
  const fadeOut = { delay: 0, duration: 50 };

  const isLoggedIn = $derived(z.current.userID !== 'anon');
  const isNewChat = $derived(chat.current === undefined);
  const canWrite = $derived(chat.current?.chatAccess.some(access => access.userId === z.current.userID) || z.current.userID === chat.current?.userId);
</script>

<div class='flex flex-col h-[calc(100dvh-88px)] md:h-[calc(100dvh-112px)] space-y-2 md:space-y-6'>
  <Card>
    <div class='flex items-center justify-between'>
      {#key chat.current?.title}
        <h2 class='text-2xl font-bold truncate' in:fade={fadeIn} out:fade={fadeOut}>
          {chat.current?.title ?? 'New Chat'}
        </h2>
      {/key}
      <!-- <ChatUsers {chatId} /> -->
    </div>
  </Card>

  <ChatMessages {chatId} {enableAnimations} />

  {#if isLoggedIn}
    {#if canWrite || isNewChat}
      <ChatInput submit={handleSubmit} locked={chat.current?.locked} />
    {:else}
      <Card>
        <h2>You don't have write access to this chat</h2>
      </Card>
    {/if}
  {:else}
    <Card>
      <h2>You must be logged in to chat</h2>
    </Card>
  {/if}
</div>
