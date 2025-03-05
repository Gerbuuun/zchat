<script lang='ts'>
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import Github from '$lib/components/github-icon.svelte';

  import Search from '$lib/components/search.svelte';
  import type { Chat } from '$lib/zero/schema';
  import { useQuery } from '$lib/zero/query.svelte';
  import { z } from '$lib/zero/z.svelte';

  import { X, Menu, MessageSquareTextIcon, MessagesSquareIcon, Plus, Power } from 'lucide-svelte';
  import { ulid } from 'ulid';
  import '../app.css';
    import { onMount } from 'svelte';

  const { children } = $props();

  let sidebarOpen = $state(false);
  const loggedIn = $derived(!!document.cookie.split('; ').find(row => row.startsWith('auth='))?.split('=')[1]);

  // Preload user and shared chats
  z.current.query.chats
    .where(q => q.or(
      q.cmp('userId', z.current.userID),
      q.exists('chatAccess', q => q.where('userId', z.current.userID)),
    ))
    .related('messages', q => q.related('chunks'))
    .related('chatAccess')
    .related('user')
    .preload();

  const user = useQuery(() => z.current.query.users.where('id', z.current.userID).one());
  const chats = useQuery(() => z.current.query.chats.where('userId', z.current.userID));
  const sharedChats = useQuery(() =>
    z.current.query.chats.whereExists('chatAccess', q =>
      q.where('userId', z.current.userID)),
  );

  const allChats = $derived([...(chats.current || []), ...(sharedChats.current || [])]);

  // Handle keyboard shortcuts for navigating between chats
  function handleKeydown(event: KeyboardEvent) {
    if (!(event.metaKey || event.ctrlKey)) return;
    if (allChats.length === 0) return;
    
    // Find current chat index
    const currentIndex = allChats.findIndex(chat => chat.id === page.params.chatId);
    
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (currentIndex > 0) {
        goto(`/${allChats[currentIndex - 1].id}`);
      } else if (currentIndex === -1) {
        goto(`/${allChats[0].id}`);
      } else {
        goto(`/${allChats[allChats.length - 1].id}`);
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (currentIndex >= 0 && currentIndex < allChats.length - 1) {
        goto(`/${allChats[currentIndex + 1].id}`);
      } else {
        goto(`/${allChats[0].id}`);
      }
    }
  }
  
  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

<svelte:head>
  <title>ZChat</title>
  <meta name='description' content='ZChat is a proof of concept LLM chat application built with Zero and Svelte and deployed on AWS using SST.' />
</svelte:head>

{#snippet chatList(label: string, chats: Chat[])}
  {#if chats.length > 0}
    <div>
      <h2 class='text-sm uppercase tracking-wider text-gray-400 font-semibold px-2 mb-2'>
        {label}
      </h2>
      <ul class='space-y-2'>
        {#each chats as chat}
          <li>
            <a
              href={`/${chat.id}`}
              class="block p-2 rounded hover:bg-gray-700 {page.url
                .pathname === `/${chat.id}`
                ? 'bg-gray-700'
                : ''}"
            >
              <span class='flex items-center gap-2'>
                {#if chat.userId === z.current.userID}
                  <MessageSquareTextIcon size={20} />
                {:else}
                  <MessagesSquareIcon size={20} />
                {/if}
                {chat.title}
              </span>
            </a>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
{/snippet}

<div class='min-h-dvh bg-gray-100'>
  <!-- Sidebar (hidden on mobile) -->
  <aside class='fixed left-0 inset-y-0 z-50 w-64 bg-gray-800 text-white {sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out'>
    <div class='h-16 px-4 border-b border-gray-700 flex justify-between items-center'>

      <a href='/' class='flex items-center gap-2'>
        <div class='bg-[url("/favicon.png")] bg-contain bg-no-repeat size-5'></div>
        <h1 class='text-xl font-bold'>ZChat</h1>
      </a>

      <!-- Close button for mobile -->
      <button
        onclick={() => sidebarOpen = false}
        class='md:hidden p-2 rounded-md text-white active:bg-gray-700 focus:outline-none'
        aria-label='close sidebar'
      >
        <X />
      </button>
    </div>

    <nav class='p-2 space-y-4'>
      <button
        class='p-2 rounded hover:bg-gray-700 w-full'
        onclick={() => goto(`/${ulid()}`)}
      >
        <span class='flex items-center gap-2'>
          <Plus />
          Create New Chat
        </span>
      </button>

      {@render chatList('My Chats', chats.current)}

      {@render chatList('Shared With Me', sharedChats.current)}
    </nav>
  </aside>

  <!-- Main content -->
  <div class='fixed inset-0 flex flex-col flex-1 md:ml-64'>
    <header class='bg-white shadow-sm'>
      <div class='flex items-center h-16 px-4 gap-4'>
        <!-- Mobile menu button -->
        <button
          onclick={() => sidebarOpen = true}
          class='md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 active:bg-gray-100 focus:outline-none'
          aria-label='toggle sidebar'
        >
          <Menu />
        </button>

        <!-- Search bar (desktop only) -->
        <Search />

        <!-- User profile and logout on desktop and mobile -->
        {#if loggedIn}
          <div class='flex items-center gap-4 ml-auto'>
            <span class='text-sm font-medium text-gray-700 hidden md:inline-block'>
              {user.current?.name}
            </span>
            <img
              src={`https://github.com/${user.current?.username}.png`}
              alt='Profile'
              class='size-8 rounded-full object-cover mr-2'
            />
          </div>

          <button
            class='p-2 flex flex-row gap-2 items-center rounded-md text-white bg-[#FF3E00] hover:bg-[#FF5722] focus:outline-none focus:ring-2 focus:ring-[#FF3E00]'
            onclick={() => {
              document.cookie = 'auth=; Path=/; Max-Age=0; SameSite=Lax';
              window.location.href = '/';
            }}
          >
            <span class='hidden md:inline-block'>Logout</span>
            <Power size={20} />
          </button>
        {:else}
          <a
            href='/api/auth'
            class='py-2 px-4 rounded-md text-white bg-[#FF3E00] hover:bg-[#FF5722] focus:outline-none focus:ring-2 focus:ring-[#FF3E00] inline-flex items-center gap-4 ml-auto'
          >
            Login
            <Github />
          </a>
        {/if}
      </div>
    </header>

    <!-- Page content -->
    <main class='p-2 md:p-6 space-y-2 md:space-y-6 flex-1 overflow-y-auto overflow-x-hidden'>
      {@render children()}
    </main>
  </div>
</div>
