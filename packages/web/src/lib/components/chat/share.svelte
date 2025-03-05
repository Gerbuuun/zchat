<script lang='ts'>
  import { page } from '$app/state';
  import { Copy, Share2, X } from 'lucide-svelte';

  import { showToast } from '$lib/toaster';
  import { useQuery } from '$lib/zero/query.svelte';
  import { z } from '$lib/zero/z.svelte';
  import { ulid } from 'ulid';

  const { chatId }: { chatId: string } = $props();

  const chat = useQuery(() => z.current.query.chats.where('id', chatId).one());
  const shares = useQuery(() =>
    z.current.query.chat_access.where('chatId', chatId).related('user'),
  );

  let dialogElement: HTMLDialogElement;
  let githubUsername = $state('');

  async function addUser() {
    if (!githubUsername)
      return;

    const user = z.current.query.users.where('username', githubUsername).one().materialize();
    if (user.data) {
      z.current.mutate.chat_access.insert({
        id: ulid(),
        chatId,
        userId: user.data?.id,
        write: false,
      });
    }
    else {
      const res = await fetch(`https://ungh.cc/users/${githubUsername}`);
      if (res.ok) {
        const { user } = await res.json();
        const userId = ulid();
        z.current.mutateBatch((tx) => {
          tx.users.insert({
            id: userId,
            githubId: user.id,
            name: user.name,
            username: user.username,
          });
          tx.chat_access.insert({
            id: ulid(),
            chatId,
            userId,
            write: false,
          });
        });
      }
    }

    githubUsername = '';
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
</script>

{#snippet toggle(labels: [string, string], checked: boolean | undefined, onchange: (e: Event & { currentTarget: EventTarget & HTMLInputElement }) => void)}
  <label class='inline-flex items-center cursor-pointer'>
    <span class='text-sm font-medium text-gray-700'>
      {labels[checked ? 0 : 1]}
    </span>
    <input
      type='checkbox'
      class='sr-only peer'
      {checked}
      {onchange}
    />
    <div class="mx-2 relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-[#FF3E00] peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF3E00]"></div>
  </label>
{/snippet}

<button
  class='ml-2 p-2 rounded-md flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
  onclick={() => dialogElement?.showModal()}
  aria-label='Share chat'
>
  <Share2 size={20} />
  <span class='hidden md:block'>Share</span>
</button>

<dialog bind:this={dialogElement} class='max-h-full rounded-lg shadow-lg w-full max-w-xl p-4 md:mx-auto md:mt-[20vh] inset-0 m-0 h-full md:h-fit'>
  <div class='flex justify-between items-center mb-4'>
    <h2 class='text-xl font-bold'>Share Chat</h2>
    <button
      class='text-gray-500 hover:text-gray-700'
      onclick={() => dialogElement?.close()}
      aria-label='Close'
    >
      <X />
    </button>
  </div>

  <div class='mb-4'>
    <label for='githubUsername' class='block text-sm font-medium text-gray-700 mb-1'>
      Add user by github username
    </label>
    <div class='flex'>
      <input
        id='githubUsername'
        type='text'
        bind:value={githubUsername}
        placeholder='username'
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
    <h3 class='text-sm font-medium text-gray-700 mb-2'>Currently shared with</h3>
    {#if shares.current.length === 0}
      <p class='text-sm text-gray-500 italic'>No users have been added yet</p>
    {:else}
      <ul class='divide-y divide-gray-200'>
        {#each shares.current as share}
          {#if share.user}
            <li class='py-3 flex items-center justify-between'>
              <div class='flex items-center'>
                <div class='size-8 rounded-full overflow-hidden bg-gray-200 mr-3'>
                  <img
                    src={`https://github.com/${share.user.username}.png`}
                    alt={share.user.name || 'User'}
                    class='h-full w-full object-cover'
                  />
                </div>
                <div>
                  <p class='font-medium'>{share.user.name || 'Unknown User'}</p>
                  <p class='text-sm text-gray-500'>{share.user.username || ''}</p>
                </div>
              </div>
              <div class='flex items-center gap-2'>
                {@render toggle(['Write', 'Read'], share.write, (e) => {
                  setWrite(share.id, e.currentTarget.checked);
                })}
                <button
                  class='p-1 rounded text-red-500 hover:bg-red-50'
                  aria-label='Remove user'
                  onclick={() => removeShare(share.id)}
                >
                  <X size={20} />
                </button>
              </div>
            </li>
          {/if}
        {/each}
      </ul>
    {/if}
  </div>

  <div class='flex items-center mb-3'>
    <p class='text-sm font-medium text-gray-700 mr-auto'>Public Access</p>
    <div class='flex items-center gap-2'>
      {@render toggle(['Public', 'Private'], chat.current?.public, (e) => {
        z.current.mutate.chats.update({
          id: chatId,
          public: e.currentTarget.checked,
        });
      })}

      <button
        class='p-1 rounded text-gray-500 hover:bg-gray-50'
        aria-label='Copy link'
        onclick={() => navigator.clipboard.writeText(`${page.url.origin}/chat/${chatId}`).then(() => showToast('Link copied to clipboard'))}
      >
        <Copy size={20} />
      </button>
    </div>
  </div>
</dialog>
