// Quick and dirty toast notification
export function showToast(message: string) {
  const toast = document.createElement('div');
  toast.className = 'fixed top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg z-50';
  toast.textContent = message;
  document.body.appendChild(toast);

  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
    setTimeout(() => document.body.removeChild(toast), 300);
  }, 3000);
}
