<script lang='ts'>
  const { size = 20, color = 'currentColor' } = $props();
</script>

<svg
  xmlns='http://www.w3.org/2000/svg'
  width={size}
  height={size}
  viewBox='0 0 20 20'
  fill={color}
>
  <path
    fill-rule='evenodd'
    d='M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z'
    clip-rule='evenodd'
  />
</svg>
