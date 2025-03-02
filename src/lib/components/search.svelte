<script lang='ts'>
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import Chat from '$lib/components/icons/chat.svelte';
  import Close from '$lib/components/icons/close.svelte';

  import Pencil from '$lib/components/icons/pencil.svelte';
  import Plus from '$lib/components/icons/plus.svelte';
  import Search from '$lib/components/icons/search.svelte';
  import Share from '$lib/components/icons/share.svelte';
  import { showToast } from '$lib/toaster';
  import { useQuery } from '$lib/zero/query.svelte';
  import { z } from '$lib/zero/z.svelte';
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { ulid } from 'ulid';

  let search = $state('');

  const chats = useQuery(() =>
    z.current.query.chats.where(q =>
      q.or(
        q.cmp('id', 'ILIKE', search),
        q.cmp('title', 'ILIKE', search),
        q.cmp('description', 'ILIKE', search),
      ),
    ),
  );

  let modal = $state<HTMLDialogElement | null>(null);

  function shortcut(event: KeyboardEvent, key: string, callback: () => void) {
    if ((event.metaKey || event.ctrlKey) && event.key === key) {
      event.preventDefault();
      callback();
    }
  }

  // Modal shortcuts
  function handleKeydown(event: KeyboardEvent) {
    // Toggle search menu
    shortcut(event, 'k', () => {
      if (modal?.open) {
        modal?.close();
      }
      else {
        modal?.showModal();
      }
    });

    if (modal?.open) {
      // Create new chat with Cmd+N
      shortcut(event, 'n', () => {
        goto('/');
        modal?.close();
      });

      // Share current chat with Cmd+S
      shortcut(event, 's', () => {
        const currentChatId = page.params.chatId;
        if (currentChatId) {
          // Save chat url to clipboard
          const chatUrl = `${window.location.origin}/${currentChatId}`;
          navigator.clipboard.writeText(chatUrl);
          modal?.close();
        }
      });

      // Add user to current chat with Cmd+A
      shortcut(event, 'a', () => {
        const currentChatId = page.params.chatId;
        if (currentChatId) {
          // TODO: Add user to chat
          modal?.close();
        }
      });

      // Move up and down with arrow keys
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
      }
    }
  }

  onMount(() => {
    modal = document.getElementById('searchModal') as HTMLDialogElement;

    window.addEventListener('keydown', handleKeydown);

    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  });

  const shortCuts = [
    {
      label: 'New Chat',
      icon: Chat,
      action: () => {
        goto(`/${ulid()}`).then(() =>
          document.querySelector('textarea')?.focus(),
        );
        modal?.close();
      },
    },
    {
      label: 'Share Chat',
      icon: Share,
      action: () => {
        const currentChatId = page.params.chatId;
        if (currentChatId) {
          navigator.clipboard
            .writeText(`${window.location.origin}/${currentChatId}`)
            .then(() => showToast('Link copied to clipboard!'));
          modal?.close();
        }
      },
    },
    {
      label: 'Edit Title',
      icon: Pencil,
      action: () => {
        modal?.close();
      },
    },
    {
      label: 'Add User',
      icon: Plus,
      action: () => {
        const currentChatId = page.params.chatId;
        if (currentChatId) {
          // TODO: Add user to chat
          modal?.close();
        }
      },
    },
    {
      label: 'Delete Chat',
      icon: Close,
      action: () => {
        const currentChatId = page.params.chatId;
        modal?.close();
        goto('/');
        z.current.mutate.chats.delete({ id: currentChatId });
      },
    },
  ];

  const filteredShortcuts = $derived(shortCuts.filter(s => search.length === 0 || s.label.toLowerCase().includes(search.toLowerCase())));
</script>

<div class='w-md'>
  <div class='relative'>
    <!-- Desktop search button with text -->
    <button
      type='button'
      class='hidden md:flex w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent text-left text-gray-500'
      onclick={() => modal?.showModal()}
    >
      Search...
    </button>
    <div class='hidden md:block absolute left-3 top-2.5 text-gray-400'>
      <Search />
    </div>

    <!-- Mobile search icon only -->
    <button
      onclick={() => modal?.showModal()}
      class='md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 active:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-400'
      aria-label='Search'
    >
      <Search />
    </button>
  </div>

  <dialog
    id='searchModal'
    class='max-h-full rounded-lg shadow-lg w-full max-w-xl p-4 md:mx-auto md:mt-[20vh] inset-0 m-0 h-full md:h-fit'
    transition:fly={{ y: -20, duration: 200 }}
  >
    <div class='flex justify-between items-center mb-4'>
      <h3 class='text-lg font-medium'>Search Chats</h3>
      <button
        class='text-gray-500 hover:text-gray-700'
        onclick={() => modal?.close()}
        aria-label='Close search modal'
      >
        <Close />
      </button>
    </div>

    <div class='relative mb-4'>
      <!-- svelte-ignore a11y_autofocus -->
      <input
        type='search'
        bind:value={search}
        placeholder='Type to search...'
        class='w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent'
        autofocus
      />
      <div class='absolute left-3 top-2.5 text-gray-400'>
        <Search />
      </div>
    </div>

    <div class='max-h-60 overflow-auto'>
      {#if filteredShortcuts.length > 0}
        <div class='flex flex-col text-gray-500 p-1'>
          <div class='text-sm font-medium'>Shortcuts</div>
          {#each filteredShortcuts as shortcut}
            <button
              class='flex items-center gap-2 py-1 px-2 rounded-md hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors duration-200 w-full text-left'
              onclick={shortcut.action}
            >
              <shortcut.icon />
              {shortcut.label}
            </button>
          {/each}
        </div>
      {/if}

      {#if search.length > 0}
        {#if chats.current.length > 0}
          <ul class='divide-y divide-gray-200'>
            {#each chats.current as chat}
              <li>
                <a
                  href={`/${chat.id}`}
                  class='block px-4 py-3 hover:bg-gray-100 text-gray-700'
                  onclick={() => modal?.close()}
                >
                  {chat.title}
                </a>
              </li>
            {/each}
          </ul>
        {:else}
          <div class='text-center py-4 text-gray-500'>
            No chats found matching your search
          </div>
        {/if}
      {/if}
    </div>
  </dialog>
</div>
