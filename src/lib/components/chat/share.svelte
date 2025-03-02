<script lang='ts'>
  import type { User } from '$lib/zero/schema';
  import Close from '$lib/components/icons/close.svelte';
  import Share from '$lib/components/icons/share.svelte';
  import { useQuery } from '$lib/zero/query.svelte';
  import { z } from '$lib/zero/z.svelte';
  import { onMount } from 'svelte';

  const { chatId }: { chatId: string } = $props();

  const shares = useQuery(() =>
    z.current.query.chat_access.where('chatId', chatId).related('user'),
  );

  let dialogElement: HTMLDialogElement;
  let newUserEmail = $state('');

  function openShareDialog() {
    dialogElement?.showModal();
  }

  function closeShareDialog() {
    dialogElement?.close();
  }

  function addUser() {
    if (!newUserEmail)
      return;

    // TODO: Add user to chat

    newUserEmail = '';
  }

  function setWrite(shareId: string, write: boolean) {
    z.current.mutate.chat_access.update({
      id: shareId,
      write,
    });
  }

  function removeShare(shareId: string) {
    z.current.mutate.chat_access.delete({
      id: shareId,
    });
  }

  // Add some test data if in development mode
  onMount(() => {
    if (import.meta.env.DEV && shares.current.length === 0) {
      // Simulate some test shares
      const testUsers: User[] = [
        {
          id: 'test-user-1',
          name: 'Alice Johnson',
          email: 'alice@example.com',
          avatarUrl: 'https://i.pravatar.cc/150?img=1',
        },
        {
          id: 'test-user-2',
          name: 'Bob Smith',
          email: 'bob@example.com',
          avatarUrl: 'https://i.pravatar.cc/150?img=2',
        },
        {
          id: 'test-user-3',
          name: 'Carol Davis',
          email: 'carol@example.com',
          avatarUrl: '',
        },
      ];

      // Add test shares to the UI (this doesn't persist to the database)
      testUsers.forEach((user) => {
        shares.current.push({
          id: `test-share-${user.id}`,
          chatId,
          userId: user.id,
          write: true,
          user,
        });
      });
    }
  });
</script>

<div class='flex items-center'>
  <div class='flex -space-x-2 overflow-hidden'>
    {#each shares.current as share}
      {#if share.user}
        <div class='inline-block size-8 rounded-full ring-2 ring-white overflow-hidden bg-gray-200'>
          {#if share.user.avatarUrl}
            <img
              src={share.user.avatarUrl}
              alt={share.user.name || 'User'}
              class='h-full w-full object-cover'
            />
          {:else}
            <div class='h-full w-full flex items-center justify-center bg-blue-500 text-white font-medium'>
              {(share.user.name || 'U').charAt(0).toUpperCase()}
            </div>
          {/if}
        </div>
      {/if}
    {/each}
  </div>

  <button
    class='ml-2 p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
    onclick={openShareDialog}
    aria-label='Share chat'
  >
    <Share />
  </button>
</div>

<dialog bind:this={dialogElement} class='max-h-full rounded-lg shadow-lg w-full max-w-xl p-4 md:mx-auto md:mt-[20vh] inset-0 m-0 h-full md:h-fit'>
  <div class='flex justify-between items-center mb-4'>
    <h2 class='text-xl font-bold'>Share Chat</h2>
    <button
      class='text-gray-500 hover:text-gray-700'
      onclick={closeShareDialog}
      aria-label='Close'
    >
      <Close />
    </button>
  </div>

  <div class='mb-4'>
    <label for='userEmail' class='block text-sm font-medium text-gray-700 mb-1'>
      Add user by email
    </label>
    <div class='flex'>
      <input
        id='userEmail'
        type='email'
        bind:value={newUserEmail}
        placeholder='user@example.com'
        class='flex-1 rounded-l-md border border-gray-300 px-3 py-2 focus:border-[#FF3E00] focus:ring-[#FF3E00] focus:outline-none'
      />
      <button
        class='bg-[#FF3E00] text-white px-4 py-2 rounded-r-md hover:bg-[#FF5722] focus:outline-none focus:ring-2 focus:ring-[#FF3E00] focus:ring-offset-2'
        onclick={addUser}
      >
        Add
      </button>
    </div>
  </div>

  <div class='mb-6'>
    <h3 class='text-sm font-medium text-gray-700 mb-2'>Current users</h3>
    {#if shares.current.length === 0}
      <p class='text-sm text-gray-500 italic'>No users have been added yet</p>
    {:else}
      <ul class='divide-y divide-gray-200'>
        {#each shares.current as share}
          {#if share.user}
            <li class='py-3 flex items-center justify-between'>
              <div class='flex items-center'>
                <div class='size-8 rounded-full overflow-hidden bg-gray-200 mr-3'>
                  {#if share.user.avatarUrl}
                    <img
                      src={share.user.avatarUrl}
                      alt={share.user.name || 'User'}
                      class='h-full w-full object-cover'
                    />
                  {:else}
                    <div class='h-full w-full flex items-center justify-center bg-[#FF3E00] text-white font-medium'>
                      {(share.user.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  {/if}
                </div>
                <div>
                  <p class='font-medium'>{share.user.name || 'Unknown User'}</p>
                  <p class='text-sm text-gray-500'>{share.user.email || ''}</p>
                </div>
              </div>
              <div class='flex items-center gap-2'>
                <label class='inline-flex items-center cursor-pointer'>
                  <input
                    type='checkbox'
                    class='sr-only peer'
                    checked={share.write}
                    onchange={e =>
                      setWrite(share.id, e.currentTarget.checked)}
                  />
                  <div class="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-[#FF3E00] peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF3E00]"></div>
                  <span class='ms-2 text-sm font-medium text-gray-700'>
                    {share.write ? 'Write' : 'Read'}
                  </span>
                </label>
                <button
                  class='p-1 rounded text-red-500 hover:bg-red-50'
                  aria-label='Remove user'
                  onclick={() => removeShare(share.id)}
                >
                  <Close />
                </button>
              </div>
            </li>
          {/if}
        {/each}
      </ul>
    {/if}
  </div>
</dialog>
