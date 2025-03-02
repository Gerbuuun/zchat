<script lang='ts'>
  import { page } from '$app/state';
  import Chat from '$lib/components/chat/index.svelte';
</script>

<Chat chatId={page.params.chatId} />
