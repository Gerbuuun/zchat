<script lang='ts'>
  import Card from '$lib/components/card.svelte';
  import ChatInput from '$lib/components/chat/input.svelte';
  import ChatMessages from '$lib/components/chat/messages.svelte';
  import ChatUsers from '$lib/components/chat/share.svelte';

  import { useQuery } from '$lib/zero/query.svelte';
  import { z } from '$lib/zero/z.svelte';
  import { fade } from 'svelte/transition';

  const { chatId }: { chatId: string } = $props();

  const chat = useQuery(() => z.current.query.chats.where('id', chatId).one());

  let enableAnimations = $state(false);

  function handleSubmit(message: string) {
    if (!chat.current) {
      z.current.mutate.chats.insert({
        id: chatId,
        title: 'New Chat',
        userId: z.current.userID,
        public: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    enableAnimations = true;
    fetch(`/api/chat/${chatId}`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  const fadeIn = { delay: 50, duration: 50 };
  const fadeOut = { delay: 0, duration: 50 };
</script>

<div class='flex flex-col h-[calc(100dvh-88px)] md:h-[calc(100dvh-112px)] space-y-2 md:space-y-6'>
  <Card>
    <div class='flex items-center justify-between'>
      {#key chat.current?.title}
        <h2 class='text-2xl font-bold truncate' in:fade={fadeIn} out:fade={fadeOut}>
          {chat.current?.title ?? 'New Chat'}
        </h2>
      {/key}
      <ChatUsers {chatId} />
    </div>
  </Card>

  <ChatMessages {chatId} {enableAnimations} />

  <ChatInput submit={handleSubmit} />
</div>
