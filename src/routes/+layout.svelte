<script lang='ts'>
  import { goto } from '$app/navigation';

  import { page } from '$app/state';
  import Chat from '$lib/components/icons/chat.svelte';
  import Close from '$lib/components/icons/close.svelte';
  import Github from '$lib/components/icons/github.svelte';
  import Hamburger from '$lib/components/icons/hamburger.svelte';
  import Plus from '$lib/components/icons/plus.svelte';

  import Search from '$lib/components/search.svelte';
  import { useQuery } from '$lib/zero/query.svelte';
  import { z } from '$lib/zero/z.svelte';
  import { ulid } from 'ulid';
  import '../app.css';

  const { children } = $props();

  // Toggle sidebar on mobile
  let sidebarOpen = $state(false);
  const toggleSidebar = () => {
    sidebarOpen = !sidebarOpen;
  };

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

  const user = useQuery(() =>
    z.current.query.users.where('id', z.current.userID).one(),
  );
  const chats = useQuery(() =>
    z.current.query.chats.where('userId', z.current.userID),
  );
  const sharedChats = useQuery(() =>
    z.current.query.chats.whereExists('chatAccess', q =>
      q.where('userId', z.current.userID)),
  );

  const authCookie = $derived(document.cookie.split('; ').find(row => row.startsWith('auth='))?.split('=')[1]);
</script>

<div class='min-h-dvh bg-gray-100'>
  <!-- Sidebar (hidden on mobile) -->
  <aside class={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 text-white ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
    <div class='h-16 px-4 border-b border-gray-700 flex justify-between items-center'>
      <a href='/' class='flex items-center gap-2'>
        <img src='/favicon.png' alt='ZChat' class='size-5' />
        <h1 class='text-xl font-bold'>ZChat</h1>
      </a>
      <!-- Close button for mobile -->
      <button
        onclick={toggleSidebar}
        class='md:hidden p-2 rounded-md text-white active:bg-gray-700 focus:outline-none'
        aria-label='close sidebar'
      >
        <Close />
      </button>
    </div>
    <nav class='p-2 space-y-4'>
      <div>
        <ul class='space-y-2'>
          <li>
            <button
              class='block p-2 rounded hover:bg-gray-700 w-full'
              onclick={() => goto(`/${ulid()}`)}
            >
              <span class='flex items-center gap-2'>
                <Plus />
                Create New Chat
              </span>
            </button>
          </li>
        </ul>
      </div>

      {#if chats.current.length > 0}
        <div>
          <h2 class='text-sm uppercase tracking-wider text-gray-400 font-semibold px-2 mb-2'>
            My Chats
          </h2>
          <ul class='space-y-2'>
            {#each chats.current as chat}
              <li>
                <a
                  href={`/${chat.id}`}
                  class="block p-2 rounded hover:bg-gray-700 {page.url
                    .pathname === `/${chat.id}`
                    ? 'bg-gray-700'
                    : ''}"
                >
                  <span class='flex items-center gap-2'>
                    <Chat />
                    {chat.title}
                  </span>
                </a>
              </li>
            {/each}
          </ul>
        </div>
      {/if}

      {#if sharedChats.current.length > 0}
        <div>
          <h2 class='text-sm uppercase tracking-wider text-gray-400 font-semibold px-2 mb-2'>
            Shared With Me
          </h2>
          <ul class='space-y-2'>
            {#each sharedChats.current as chat}
              <li>
                <a
                  href={`/${chat.id}`}
                  class="block p-2 rounded hover:bg-gray-700 {page.url
                    .pathname === `/${chat.id}`
                    ? 'bg-gray-700'
                    : ''}"
                >
                  <span class='flex items-center gap-2'>
                    <Chat />
                    {chat.title}
                  </span>
                </a>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    </nav>
  </aside>

  <!-- Main content -->
  <div class='md:ml-64 h-dvh flex flex-col'>
    <!-- Header -->
    <header class='bg-white shadow-sm fixed top-0 left-0 right-0 z-10 md:left-64'>
      <div class='flex items-center h-16 px-4 gap-4'>
        <!-- Mobile menu button -->
        <button
          onclick={toggleSidebar}
          class='md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 active:bg-gray-100 focus:outline-none'
          aria-label='toggle sidebar'
        >
          <Hamburger />
        </button>

        <!-- Search bar (desktop only) -->
        <Search />

        <!-- User profile and logout on desktop and mobile -->
        {#if authCookie}
          <div class='flex items-center ml-auto'>
            <div class='flex items-center gap-4'>
              <span class='text-sm font-medium text-gray-700 hidden md:inline-block'>
                {user.current?.name}
              </span>
              <img
                src={`https://github.com/${user.current?.username}.png`}
                alt='Profile'
                class='h-8 w-8 rounded-full object-cover mr-2'
              />
            </div>
            <button 
              class='p-2 rounded-md text-white bg-[#FF3E00] hover:bg-[#FF5722] focus:outline-none focus:ring-2 focus:ring-[#FF3E00] ml-2'
              onclick={() => {
                document.cookie = 'auth=; Path=/; Max-Age=0; SameSite=Lax';
                window.location.href = '/';
              }}
            >
              Logout
            </button>
          </div>
        {:else}
          <div class='flex items-center ml-auto'>
            <a
              href='/api/auth'
              class='py-2 px-4 rounded-md text-white bg-[#FF3E00] hover:bg-[#FF5722] focus:outline-none focus:ring-2 focus:ring-[#FF3E00] flex items-center gap-4'
            >
              Login
              <Github />
            </a>
          </div>
        {/if}
      </div>
    </header>

    <!-- Page content -->
    <main class='p-2 mt-16 md:p-6 space-y-2 md:space-y-6 flex-1 overflow-y-auto overflow-x-hidden'>
      {@render children()}
    </main>
  </div>
</div>
