<script lang='ts'>
  const { submit }: { submit: (message: string) => void } = $props();

  let message = $state('');
  let textarea: HTMLTextAreaElement;
  let isSubmitting = $state(false);

  function handleKeydown(event: KeyboardEvent) {
    // Submit on Enter (without Shift)
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submitMessage();
    }
  }

  async function submitMessage() {
    if (!message.trim() || isSubmitting)
      return;

    isSubmitting = true;

    try {
      submit(message.trim());
      message = '';

      // Reset textarea height
      if (textarea) {
        textarea.style.height = 'auto';
      }
    }
    finally {
      isSubmitting = false;
    }
  }

  function autoResize() {
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }
</script>

<div class='bg-white rounded-lg shadow p-4'>
  <div class='flex flex-col'>
    <!-- svelte-ignore a11y_autofocus -->
    <textarea
      bind:this={textarea}
      bind:value={message}
      oninput={autoResize}
      onkeydown={handleKeydown}
      placeholder='Type your message here...'
      class='w-full resize-none overflow-hidden focus:outline-none min-h-[60px] max-h-[200px]'
      rows='1'
      autofocus
    ></textarea>

    <div class='flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 gap-2 sm:gap-0'>
      <div class='text-xs text-gray-500 order-2 self-end sm:order-1 w-full sm:w-auto hidden md:block'>
        Press Enter to send, Shift+Enter for new line
      </div>
      <button
        onclick={submitMessage}
        disabled={!message.trim() || isSubmitting}
        class='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2 w-full sm:w-auto'
      >
        {isSubmitting ? 'Sending...' : 'Send'}
      </button>
    </div>
  </div>
</div>
