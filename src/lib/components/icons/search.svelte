<script lang='ts'>
  const { size = 22, color = 'currentColor' } = $props();
</script>

<svg
  xmlns='http://www.w3.org/2000/svg'
  width={size}
  height={size}
  fill='none'
  viewBox='0 0 24 24'
  stroke={color}
>
  <path
    stroke-linecap='round'
    stroke-linejoin='round'
    stroke-width='2'
    d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
  />
</svg>
