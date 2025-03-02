<script lang='ts'>
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import ChatMatch from '$lib/components/chat-match.svelte';
  
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
  import { ulid } from 'ulid';

  let search = $state('');
  let selectedIndex = $state(0);
  let modal = $state<HTMLDialogElement | null>(null);

  const navigableItems = $derived.by(() => {
    const items: Array<{ type: 'shortcut' | 'chat', index: number }> = [];
    
    // Add shortcuts
    filteredShortcuts.forEach((_, index) => {
      items.push({ type: 'shortcut', index });
    });
    
    // Add chats
    if (search.length > 0 && chats.current.length > 0) {
      chats.current.forEach((_, index) => {
        items.push({ type: 'chat', index });
      });
    }
    
    return items;
  })

  // Using this query will throw an error because of the multiple LIKE queries and OR conditions
  // const chats = useQuery(() => z.current.query.chats
  //   .where(q =>
  //     q.or(
  //       q.cmp('userId', z.current.userID),
  //       q.exists('chatAccess', q => q.where('userId', z.current.userID)),
  //     )
  //   )
  //   .where(q =>
  //     q.or(
  //       q.cmp('title', 'ILIKE', `%${search}%`),
  //       q.exists('messages', q => q.whereExists('chunks', q => q.where('content', 'ILIKE', `%${search}%`))),
  //     )
  //   )
  //   .related('messages', q => q.related('chunks'))
  // );

  // Doing this way because of a potential bug when using multiple LIKE queries and OR conditions
  // https://discord.com/channels/830183651022471199/1288232858795769917/1323349821423358053
  const chats = useQuery(() => z.current.query.chats
    .where(q => q.or(
      q.cmp('userId', z.current.userID),
      q.exists('chatAccess', q => q.where('userId', z.current.userID)),
    ))
    .where('title', 'ILIKE', `%${search}%`).related('messages', q => q.related('chunks')));
  const messages = useQuery(() => z.current.query.messages
    .whereExists('chat', q => 
      q.where(q => 
        q.or(
          q.cmp('userId', z.current.userID),
          q.exists('chatAccess', q => q.where('userId', z.current.userID)),
        )
      )
    )
    .related('chunks', q => q.where('content', 'ILIKE', `%${search}%`))
    .related('chat')
  );

  const chatIds = $derived(new Set([
    ...chats.current.map(c => c.id),
    ...messages.current.map(m => m.chatId)
  ]));
  const matchedChats = useQuery(() => z.current.query.chats.where('id', 'IN', Array.from(chatIds)).related('messages', q => q.related('chunks')));

  // Handle navigation with arrow keys
  function handleNavigation(direction: 'up' | 'down') {
    if (navigableItems.length === 0) return;
    
    if (direction === 'up') {
      selectedIndex = (selectedIndex - 1 + navigableItems.length) % navigableItems.length;
    } else {
      selectedIndex = (selectedIndex + 1) % navigableItems.length;
    }
    
    // Scroll the selected item into view
    setTimeout(() => {
      const selectedElement = document.querySelector('[data-selected="true"]');
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
        (selectedElement as HTMLElement).focus();
      }
    }, 0);
  }

  // Execute the action for the selected item
  function activateSelectedItem() {
    if (selectedIndex >= 0 && selectedIndex < navigableItems.length) {
      const selected = navigableItems[selectedIndex];
      
      if (selected.type === 'shortcut') {
        // Execute shortcut action
        filteredShortcuts[selected.index].action();
      } else if (selected.type === 'chat') {
        // Navigate to chat
        goto(`/${chats.current[selected.index].id}`);
        modal?.close();
      }
    }
  }

  // Modal shortcuts
  function handleKeydown(event: KeyboardEvent) {
    // Toggle search menu
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      modal?.open ? modal?.close() : modal?.showModal();
      selectedIndex = 0;
      search = '';
    }

    if (modal?.open) {
      // Move up and down with arrow keys
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        handleNavigation('up');
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        handleNavigation('down');
      } else if (event.key === 'Enter') {
        event.preventDefault();
        activateSelectedItem();
      } else if (event.key === 'Escape') {
        modal?.close();
      }
    }
  }

  // Reset selection when search changes
  $effect(() => {
    search;
    selectedIndex = 0;
  });

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
        goto(`/${ulid()}`).then(() => document.querySelector('textarea')?.focus());
        modal?.close();
      },
    },
    {
      label: 'Share Chat',
      icon: Share,
      action: () => {
        const currentChatId = page.params.chatId;
        if (currentChatId) {
          z.current.mutate.chats.update({
            id: currentChatId,
            public: true
          })
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
        const currentChatId = page.params.chatId;
        if (currentChatId) {
          const chat = z.current.query.chats.where('id', currentChatId).one().materialize();
          if (chat) {
            const newTitle = prompt('Edit chat title:', chat.data?.title ?? 'New Chat');
            if (newTitle && newTitle.trim() !== '' && newTitle !== chat.data?.title) {
              z.current.mutate.chats.update({
                id: currentChatId,
                title: newTitle.trim()
              })
              .then(() => showToast('Chat title updated!'));
            }
          }
        }
        modal?.close();
      },
    },
    // {
    //   label: 'Add User',
    //   icon: Plus,
    //   action: () => {
    //     const currentChatId = page.params.chatId;
    //     if (currentChatId) {
    //       // TODO: Add user to chat
    //       modal?.close();
    //     }
    //   },
    // },
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
  
  // Calculate the current item index for each type
  function isSelected(type: 'shortcut' | 'chat', index: number): boolean {
    if (selectedIndex === -1) return false;
    
    const selectedItem = navigableItems[selectedIndex];
    return selectedItem && selectedItem.type === type && selectedItem.index === index;
  }
</script>

<div class='max-w-md grow'>
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
    class='max-h-full rounded-lg shadow-lg w-full max-w-xl md:mx-auto md:mt-[20vh] inset-0 m-0 h-full md:h-fit'
  >
    <div class='relative p-1 mb-2 border-b border-gray-200'>
      <!-- svelte-ignore a11y_autofocus -->
      <input
        type='search'
        bind:value={search}
        placeholder='Type to search...'
        class='w-full pl-10 pr-4 py-2 focus:outline-none focus:border-transparent'
        autofocus
      />
      <div class='absolute left-4 top-3.5 text-gray-400'>
        <Search />
      </div>
      <div class='absolute right-4 top-3.5 text-gray-400'>
        <button
          class='text-gray-500 hover:text-gray-700'
          onclick={() => modal?.close()}
          aria-label='Close search modal'
        >
          <Close />
        </button>
      </div>
    </div>

    <div class='max-h-100 overflow-auto'>
      {#if filteredShortcuts.length > 0}
        <div class='flex flex-col text-gray-500 p-2'>
          <div class='ps-3 text-sm font-medium pb-1'>Shortcuts</div>
          {#each filteredShortcuts as shortcut, i}
            <button
              class='flex items-center gap-2 py-1 px-3 rounded-md {isSelected('shortcut', i) ? 'bg-gray-100' : ''} focus:bg-gray-100 focus:outline-none transition-colors duration-200 w-full text-left'
              onclick={shortcut.action}
              data-selected={isSelected('shortcut', i)}
              onmouseover={() => selectedIndex = navigableItems.findIndex(item => item.type === 'shortcut' && item.index === i)}
              onfocus={() => selectedIndex = navigableItems.findIndex(item => item.type === 'shortcut' && item.index === i)}
            >
              <shortcut.icon />
              {shortcut.label}
            </button>
          {/each}
        </div>
      {/if}

      {#if search.length > 0}
        <div class='flex flex-col text-gray-500 p-2'>
          {#if matchedChats.current.length > 0}
            <div class='ps-3 text-sm font-medium pb-1'>Chats</div>
            <ul class='divide-y divide-gray-200'>
              {#each matchedChats.current as chat, i}
                <li>
                  <a
                    href={`/${chat.id}`}
                    class='flex items-center gap-2 py-1 px-3 rounded-md {isSelected('chat', i) ? 'bg-gray-100' : ''} focus:bg-gray-100 focus:outline-none transition-colors duration-200 w-full text-left'
                    onclick={() => modal?.close()}
                    data-selected={isSelected('chat', i)}
                    onmouseover={() => selectedIndex = navigableItems.findIndex(item => item.type === 'chat' && item.index === i)}
                    onfocus={() => selectedIndex = navigableItems.findIndex(item => item.type === 'chat' && item.index === i)}
                  >
                    <ChatMatch {chat} {search} />
                  </a>
                </li>
              {/each}
            </ul>
          {:else}
            <p class='text-center p-4 text-gray-500'>
              <span class="text-gray-500">No results found for </span>
              "<span class="inline-block max-w-[200px] truncate align-bottom">{search}</span>"
            </p>
          {/if}
        </div>
      {/if}
    </div>
  </dialog>
</div>
